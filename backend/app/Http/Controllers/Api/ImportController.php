<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use ZipArchive;

class ImportController extends Controller
{
    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="orders_template.csv"',
        ];

        return response()->stream(function () {
            echo "\xEF\xBB\xBF";
            echo "رقم_الطلب,اسم_العميل,رقم_الجوال,البريد_الإلكتروني,ملاحظات\n";
            echo "1001,أحمد محمد,0500000000,ahmed@example.com,طلب تجريبي\n";
        }, 200, $headers);
    }

    public function orders(): JsonResponse
    {
        $request = request();

        if (! $request->hasFile('file')) {
            return response()->json(['message' => 'يرجى رفع ملف CSV أو XLSX'], 422);
        }

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        if (! in_array($ext, ['csv', 'txt', 'xlsx'])) {
            return response()->json(['message' => 'الملف يجب أن يكون بصيغة CSV أو XLSX'], 422);
        }

        $rows = $ext === 'xlsx' ? $this->parseXlsx($file->getRealPath()) : $this->parseCsv($file->getRealPath());

        if ($rows === null) {
            return response()->json(['message' => 'تعذر قراءة الملف'], 422);
        }

        $merchant = $request->user()->merchant;
        $deliveryService = app(DeliveryService::class);
        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $orderNumber = trim($row[0] ?? '');
            $customerName = trim($row[1] ?? '');
            $customerPhone = trim($row[2] ?? '');
            $customerEmail = trim($row[3] ?? '') ?: null;
            $notes = trim($row[4] ?? '') ?: null;

            if (empty($orderNumber) || empty($customerName) || empty($customerPhone)) {
                $skipped++;
                continue;
            }

            $exists = Order::where('merchant_id', $merchant->id)
                ->where('order_number', $orderNumber)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $order = Order::create([
                'merchant_id' => $merchant->id,
                'order_number' => $orderNumber,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_email' => $customerEmail,
                'status' => 'pending',
                'delivery_status' => 'not_sent',
                'notes' => $notes,
            ]);

            $deliveryService->createDeliveryLink($order);
            $imported++;
        }

        return response()->json([
            'message' => "تم استيراد {$imported} طلب جديد. تم تخطي {$skipped} طلب.",
            'imported' => $imported,
            'skipped' => $skipped,
        ]);
    }

    private function parseXlsx(string $path): ?array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            return null;
        }

        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml) {
            $xml = simplexml_load_string($stringsXml);
            if ($xml) {
                foreach ($xml->si as $si) {
                    $text = '';
                    if (isset($si->t)) {
                        $text = (string) $si->t;
                    } elseif (isset($si->r)) {
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                    }
                    $sharedStrings[] = $text;
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if (! $sheetXml) {
            $zip->close();
            return null;
        }

        $xml = simplexml_load_string($sheetXml);
        if (! $xml || ! isset($xml->sheetData->row)) {
            $zip->close();
            return null;
        }

        $rows = [];
        $firstRow = true;

        foreach ($xml->sheetData->row as $row) {
            if ($firstRow) {
                $firstRow = false;
                continue;
            }

            $rowData = [];
            foreach ($row->c as $cell) {
                $value = (string) ($cell->v ?? '');

                if ((string) ($cell['t'] ?? '') === 's' && isset($sharedStrings[(int) $value])) {
                    $value = $sharedStrings[(int) $value];
                }

                $rowData[] = $value;
            }

            if (array_filter($rowData, fn ($v) => $v !== '')) {
                $rows[] = $rowData;
            }
        }

        $zip->close();

        return $rows;
    }

    private function parseCsv(string $path): ?array
    {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return null;
        }

        $rows = [];
        $rowNumber = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            if ($rowNumber === 1) {
                continue;
            }

            $trimmed = array_map('trim', $row);
            if (array_filter($trimmed, fn ($v) => $v !== '')) {
                $rows[] = $trimmed;
            }
        }

        fclose($handle);

        return $rows;
    }
}

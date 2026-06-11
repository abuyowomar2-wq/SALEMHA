<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="orders_template.csv"',
        ];

        return response()->stream(function () {
            $bom = "\xEF\xBB\xBF";
            echo $bom;
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

        $merchant = $request->user()->merchant;
        $deliveryService = app(DeliveryService::class);

        $rows = [];

        if ($ext === 'xlsx') {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            array_shift($rows);
        } else {
            $handle = fopen($file->getRealPath(), 'r');
            if ($handle === false) {
                return response()->json(['message' => 'تعذر قراءة الملف'], 422);
            }
            $rowNumber = 0;
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;
                if ($rowNumber === 1) continue;
                $rows[] = $row;
            }
            fclose($handle);
        }

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
}

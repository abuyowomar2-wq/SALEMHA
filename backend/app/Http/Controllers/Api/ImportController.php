<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class ImportController extends Controller
{
    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->stream(function () {
            echo "\xEF\xBB\xBF";
            echo "sep=;\n";
            echo "الإسم الأول;الإسم الثاني;رقم الهاتف;رقم الطلب;إسم المنتج\n";
            echo "أحمد;محمد;0500000000;1001;بطاقة ستيم\n";
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="orders_template.csv"',
        ]);
    }

    public function orders(): JsonResponse
    {
        $request = request();

        try {
            $rows = null;

            if ($request->input('text')) {
                $raw = $request->input('text');
                $raw = ltrim($raw, "\xEF\xBB\xBF");
                $raw = preg_replace('/^sep=.*\r?\n/', '', $raw);

                $stream = fopen('php://temp', 'r+');
                fwrite($stream, $raw);
                rewind($stream);

                $firstLine = fgets($stream);
                if ($firstLine !== false) {
                    rewind($stream);
                    $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

                    $rows = [];
                    $rowNumber = 0;
                    while (($row = fgetcsv($stream, 0, $delimiter)) !== false) {
                        $rowNumber++;
                        if ($rowNumber === 1) continue;
                        $row = array_map(fn ($v) => trim((string) $v, "\"' \t\n\r\0\x0B"), $row);
                        if (array_filter($row, fn ($v) => $v !== '')) $rows[] = $row;
                    }
                }
                fclose($stream);
            } elseif ($request->hasFile('file')) {
                $file = $request->file('file');
                $ext = strtolower($file->getClientOriginalExtension());

                if (! in_array($ext, ['csv', 'txt', 'xlsx'])) {
                    return response()->json(['message' => 'الملف يجب أن يكون بصيغة CSV أو XLSX'], 422);
                }

                $rows = $ext === 'xlsx' ? $this->parseXlsx($file->getRealPath()) : $this->parseCsv($file->getRealPath());
            } else {
                return response()->json(['message' => 'يرجى رفع ملف أو لصق النص'], 422);
            }

        if ($rows === null) {
            return response()->json(['message' => 'تعذر قراءة الملف'], 422);
        }

        $merchant = $request->user()->merchant;
        $deliveryService = app(DeliveryService::class);

        $imported = 0;
        $withProduct = 0;
        $noStock = 0;
        $noProduct = 0;
        $skipped = 0;

        $products = Product::where('merchant_id', $merchant->id)->pluck('id', 'name');

        foreach ($rows as $row) {
            $firstName = trim($row[0] ?? '');
            $lastName = trim($row[1] ?? '');
            $customerPhone = trim($row[2] ?? '');
            $orderNumber = trim($row[3] ?? '');
            $productName = trim($row[4] ?? '');

            $customerName = trim($firstName . ' ' . $lastName);

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

            $productId = null;
            $hasStock = false;

            if (! empty($productName)) {
                $productId = $products[$productName] ?? null;

                if ($productId) {
                    $hasStock = InventoryItem::where('product_id', $productId)
                        ->where('status', 'available')
                        ->exists();
                }
            }

            $order = Order::create([
                'merchant_id' => $merchant->id,
                'order_number' => $orderNumber,
                'product_id' => $productId,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'status' => 'pending',
                'delivery_status' => 'not_sent',
            ]);

            $deliveryService->createDeliveryLink($order);

            if ($productId && $hasStock) {
                $this->claimItem($order, $productId);
                $withProduct++;
            } elseif ($productId && ! $hasStock) {
                $noStock++;
            } elseif (! empty($productName) && ! $productId) {
                $noProduct++;
            }

            $imported++;
        }

        $parts = ["تم استيراد {$imported} طلب جديد"];
        if ($withProduct > 0) $parts[] = "✅ {$withProduct} بربط بالمنتج وجاهز للتسليم";
        if ($noStock > 0) $parts[] = "⚠️ {$noStock} بربط بالمنتج لكن المخزون فاضي";
        if ($noProduct > 0) $parts[] = "❌ {$noProduct} لم يتم العثور على المنتج";
        if ($skipped > 0) $parts[] = "تم تخطي {$skipped} طلب";

        return response()->json([
            'message' => implode("\n", $parts),
            'imported' => $imported,
            'with_product' => $withProduct,
            'no_stock' => $noStock,
            'no_product' => $noProduct,
            'skipped' => $skipped,
        ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'فشل الاستيراد: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function claimItem(Order $order, ?int $productId): void
    {
        DB::transaction(function () use ($order, $productId) {
            $item = InventoryItem::where('product_id', $productId)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (! $item) return;

            $item->update([
                'status' => 'used',
                'order_id' => $order->id,
                'used_at' => now(),
            ]);

            $order->update(['delivery_status' => 'product_viewed']);
        });
    }

    private function parseXlsx(string $path): ?array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) return null;

        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml) {
            $xml = simplexml_load_string($stringsXml);
            if ($xml) {
                foreach ($xml->si as $si) {
                    $text = '';
                    if (isset($si->t)) $text = (string) $si->t;
                    elseif (isset($si->r)) foreach ($si->r as $r) $text .= (string) $r->t;
                    $sharedStrings[] = $text;
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if (! $sheetXml) { $zip->close(); return null; }

        $xml = simplexml_load_string($sheetXml);
        if (! $xml || ! isset($xml->sheetData->row)) { $zip->close(); return null; }

        $rows = [];
        $firstRow = true;

        foreach ($xml->sheetData->row as $row) {
            if ($firstRow) { $firstRow = false; continue; }
            $rowData = [];
            foreach ($row->c as $cell) {
                $value = (string) ($cell->v ?? '');
                if ((string) ($cell['t'] ?? '') === 's' && isset($sharedStrings[(int) $value])) {
                    $value = $sharedStrings[(int) $value];
                }
                $rowData[] = $value;
            }
            if (array_filter($rowData, fn ($v) => $v !== '')) $rows[] = $rowData;
        }

        $zip->close();
        return $rows;
    }

    private function parseCsv(string $path): ?array
    {
        $content = file_get_contents($path);
        if ($content === false) return null;

        $content = ltrim($content, "\xEF\xBB\xBF");
        $content = preg_replace('/^sep=.*\r?\n/', '', $content);

        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $content);
        rewind($stream);

        $firstLine = fgets($stream);
        if ($firstLine === false) { fclose($stream); return null; }
        rewind($stream);

        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $rows = [];
        $rowNumber = 0;

        while (($row = fgetcsv($stream, 0, $delimiter)) !== false) {
            $rowNumber++;
            if ($rowNumber === 1) continue;

            $row = array_map(fn ($v) => trim((string) $v, "\"' \t\n\r\0\x0B"), $row);

            if (array_filter($row, fn ($v) => $v !== '')) {
                $rows[] = $row;
            }
        }

        fclose($stream);
        return $rows;
    }
}

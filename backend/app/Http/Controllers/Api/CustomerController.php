<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use ZipArchive;

class CustomerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $merchant = request()->user()->merchant;

        $customers = Customer::where('merchant_id', $merchant->id)
            ->latest()
            ->paginate(30);

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        $customer = Customer::create([
            'merchant_id' => $merchant->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'تم إضافة العميل بنجاح',
            'customer' => new CustomerResource($customer),
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        return response()->json([
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        $customer->update($request->only(['name', 'phone', 'email', 'notes']));

        return response()->json([
            'message' => 'تم تحديث العميل بنجاح',
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        $customer->delete();

        return response()->json(['message' => 'تم حذف العميل']);
    }

    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->stream(function () {
            echo "\xEF\xBB\xBF";
            echo "sep=;\n";
            echo "اسم_العميل;رقم_الجوال;البريد_الإلكتروني;ملاحظات\n";
            echo "أحمد محمد;0500000000;ahmed@example.com;عميل مميز\n";
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="customers_template.csv"',
        ]);
    }

    public function import(): JsonResponse
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

        $rows = $ext === 'xlsx'
            ? $this->parseXlsx($file->getRealPath())
            : $this->parseCsv($file->getRealPath());

        if ($rows === null) {
            return response()->json(['message' => 'تعذر قراءة الملف'], 422);
        }

        $merchant = $request->user()->merchant;
        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $name = trim($row[0] ?? '');
            $phone = trim($row[1] ?? '');
            $email = trim($row[2] ?? '') ?: null;
            $notes = trim($row[3] ?? '') ?: null;

            if (empty($name) || empty($phone)) {
                $skipped++;
                continue;
            }

            Customer::create([
                'merchant_id' => $merchant->id,
                'name' => $name,
                'phone' => $phone,
                'email' => $email,
                'notes' => $notes,
            ]);

            $imported++;
        }

        return response()->json([
            'message' => "تم استيراد {$imported} عميل جديد. تم تخطي {$skipped} عميل.",
            'imported' => $imported,
            'skipped' => $skipped,
        ]);
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

        $tmpFile = tempnam(sys_get_temp_dir(), 'csv_');
        file_put_contents($tmpFile, $content);

        $handle = fopen($tmpFile, 'r');
        if ($handle === false) { unlink($tmpFile); return null; }

        $firstLine = fgets($handle);
        if ($firstLine === false) { fclose($handle); unlink($tmpFile); return null; }
        rewind($handle);

        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $rows = [];
        $rowNumber = 0;
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowNumber++;
            if ($rowNumber === 1) continue;
            $row = array_map(fn ($v) => trim((string) $v, "\"' \t\n\r\0\x0B"), $row);
            if (array_filter($row, fn ($v) => $v !== '')) $rows[] = $row;
        }

        fclose($handle);
        unlink($tmpFile);
        return $rows;
    }
}

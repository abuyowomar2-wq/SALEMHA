<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class InventoryService
{
    public function encryptItem(string $data): string
    {
        return Crypt::encryptString($data);
    }

    public function decryptItem(string $encryptedData): string
    {
        return Crypt::decryptString($encryptedData);
    }

    public function parseCsv(string $filePath): array
    {
        $lines = [];
        $handle = fopen($filePath, 'r');

        if ($handle === false) {
            return [];
        }

        while (($row = fgetcsv($handle)) !== false) {
            $lines[] = $row[0] ?? trim(implode(',', $row));
        }

        fclose($handle);

        return $lines;
    }

    public function parseTextLines(string $text): array
    {
        $text = str_replace(['\\n', '\\r', '\n', '\r'], ["\n", '', "\n", ''], $text);

        return array_values(array_filter(
            preg_split('/\r\n|\r|\n/', $text),
            fn ($line) => trim($line) !== ''
        ));
    }
}

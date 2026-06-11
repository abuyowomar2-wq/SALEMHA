<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class BulkInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required_without:csv_file', 'string'],
            'csv_file' => ['required_without:items', 'file', 'mimes:csv,txt'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required_without' => 'يجب إدخال الأكواد نصيًا أو رفع ملف CSV',
            'csv_file.required_without' => 'يجب إدخال الأكواد نصيًا أو رفع ملف CSV',
        ];
    }
}

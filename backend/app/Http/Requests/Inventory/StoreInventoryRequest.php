<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'data.required' => 'البيانات الرقمية مطلوبة',
        ];
    }
}

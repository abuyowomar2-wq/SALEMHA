<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['string', 'in:code,file,link,credential,key,other'],
            'instructions' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'primary_color' => ['string', 'max:7'],
            'verification_method' => ['string', 'in:order_number_phone,order_number_code'],
            'salla_api_key' => ['nullable', 'string', 'max:500'],
            'salla_store_url' => ['nullable', 'string', 'max:500', 'url'],
            'whatsapp_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}

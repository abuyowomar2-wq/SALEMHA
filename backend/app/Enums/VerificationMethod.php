<?php

namespace App\Enums;

enum VerificationMethod: string
{
    case OrderNumberPhone = 'order_number_phone';
    case OrderNumberCode = 'order_number_code';
}

<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case NotSent = 'not_sent';
    case Sent = 'sent';
    case Opened = 'opened';
    case Verified = 'verified';
    case ProductViewed = 'product_viewed';
}

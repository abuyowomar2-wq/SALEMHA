<?php

namespace App\Enums;

enum DeliveryLogEvent: string
{
    case LinkCreated = 'link_created';
    case LinkSent = 'link_sent';
    case LinkOpened = 'link_opened';
    case VerificationSuccess = 'verification_success';
    case VerificationFailed = 'verification_failed';
    case ProductViewed = 'product_viewed';
    case LinkResent = 'link_resent';
    case OrderCancelled = 'order_cancelled';
}

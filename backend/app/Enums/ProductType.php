<?php

namespace App\Enums;

enum ProductType: string
{
    case Code = 'code';
    case File = 'file';
    case Link = 'link';
    case Credential = 'credential';
    case Key = 'key';
    case Other = 'other';
}

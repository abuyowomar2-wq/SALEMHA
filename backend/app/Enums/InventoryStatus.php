<?php

namespace App\Enums;

enum InventoryStatus: string
{
    case Available = 'available';
    case Used = 'used';
    case Disabled = 'disabled';
}

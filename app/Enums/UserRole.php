<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'Admin';
    case INACTIVE = 'Inactive';
    case SUPER_ADMIN = 'Super Admin';
}

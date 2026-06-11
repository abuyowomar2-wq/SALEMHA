<?php

namespace Database\Seeders;

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'مدير النظام',
            'email' => 'admin@sallemha.com',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);

        Merchant::create([
            'user_id' => $admin->id,
            'store_name' => 'سلّمها | الإدارة',
            'store_slug' => 'sallemha-admin',
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'سلطان الأحمري',
            'email' => 'abuyowomar2@gmail.com',
            'password' => 'Salemha@Admin2030',
            'role' => 'admin',
            'is_active' => true,
        ]);

        Merchant::create([
            'user_id' => $admin->id,
            'store_name' => 'سلّمها | سوبر أدمن',
            'store_slug' => 'sallemha-super-admin',
            'primary_color' => '#1659D3',
            'plan' => 'professional',
        ]);
    }
}

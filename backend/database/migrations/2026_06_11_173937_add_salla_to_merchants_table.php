<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->string('salla_api_key')->nullable()->after('settings');
            $table->string('salla_store_url')->nullable()->after('salla_api_key');
            $table->string('whatsapp_phone')->nullable()->after('salla_store_url');
        });
    }

    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn(['salla_api_key', 'salla_store_url', 'whatsapp_phone']);
        });
    }
};

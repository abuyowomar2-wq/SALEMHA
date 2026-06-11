<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_links', function (Blueprint $table) {
            $table->renameColumn('token', 'token_hash');
        });

        Schema::table('delivery_links', function (Blueprint $table) {
            $table->timestamp('last_accessed_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_links', function (Blueprint $table) {
            $table->dropColumn('last_accessed_at');
            $table->renameColumn('token_hash', 'token');
        });
    }
};

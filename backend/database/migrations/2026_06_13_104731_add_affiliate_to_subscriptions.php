<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('referral_code')->nullable()->after('bank_reference');
            $table->decimal('commission_amount', 10, 2)->nullable()->after('referral_code');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['referral_code', 'commission_amount']);
        });
    }
};

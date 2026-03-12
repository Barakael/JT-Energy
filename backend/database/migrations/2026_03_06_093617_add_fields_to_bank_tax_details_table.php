<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_tax_details', function (Blueprint $table) {
            $table->string('account_name')->nullable()->after('bank_name');
            $table->string('account_type')->nullable()->after('account_name'); // e.g. Current, Savings
            $table->string('swift_bic')->nullable()->after('sort_code');
            $table->string('iban')->nullable()->after('swift_bic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_tax_details', function (Blueprint $table) {
            $table->dropColumn(['account_name', 'account_type', 'swift_bic', 'iban']);
        });
    }
};

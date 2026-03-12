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
        Schema::table('payslips', function (Blueprint $table) {
            $table->string('quarter')->nullable()->after('period'); // e.g. "Q1", "Q2"
            $table->integer('year')->nullable()->after('quarter');
            $table->string('authorized_by')->nullable()->after('status');
            $table->date('date_issued')->nullable()->after('authorized_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn(['quarter', 'year', 'authorized_by', 'date_issued']);
        });
    }
};

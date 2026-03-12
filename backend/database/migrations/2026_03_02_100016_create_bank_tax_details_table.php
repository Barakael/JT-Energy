<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_tax_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('bank_name')->nullable();
            $table->text('account_number')->nullable(); // encrypted
            $table->string('sort_code')->nullable();
            $table->string('tax_code')->nullable();
            $table->string('national_insurance')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_tax_details');
    }
};

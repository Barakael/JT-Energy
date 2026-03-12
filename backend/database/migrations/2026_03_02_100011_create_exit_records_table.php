<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exit_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('exit_type', ['Resignation', 'Termination', 'Retirement']);
            $table->date('last_day');
            $table->enum('clearance_status', ['Not Started', 'In Progress', 'Completed', 'Pending'])->default('Not Started');
            $table->enum('status', ['Initiated', 'In Progress', 'Completed'])->default('Initiated');
            $table->foreignId('initiated_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exit_records');
    }
};

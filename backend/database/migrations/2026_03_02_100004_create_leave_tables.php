<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['Annual', 'Sick', 'Personal', 'Parental']);
            $table->unsignedSmallInteger('total')->default(0);
            $table->unsignedSmallInteger('used')->default(0);
            $table->year('year');
            $table->timestamps();
            $table->unique(['user_id', 'type', 'year']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['Annual', 'Sick', 'Personal', 'Parental']);
            $table->date('from_date');
            $table->date('to_date');
            $table->unsignedSmallInteger('days')->default(1);
            $table->text('reason')->nullable();
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_balances');
    }
};

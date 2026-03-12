<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('new_hires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('role'); // job title
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->date('start_date');
            $table->unsignedSmallInteger('progress')->default(0);
            $table->foreignId('buddy_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('onboarding_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('task');
            $table->enum('category', ['Legal', 'Payroll', 'Security', 'IT', 'Training', 'Culture', 'Policy']);
            $table->boolean('done')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_tasks');
        Schema::dropIfExists('new_hires');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location')->nullable();
            $table->enum('type', ['Full-time', 'Part-time', 'Contract', 'Internship'])->default('Full-time');
            $table->unsignedInteger('applicants')->default(0);
            $table->enum('status', ['Open', 'Closed'])->default('Open');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('posted_at')->useCurrent();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hr_jobs');
    }
};

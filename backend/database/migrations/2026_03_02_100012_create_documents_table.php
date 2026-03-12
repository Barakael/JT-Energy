<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['Contract', 'Legal', 'Review', 'Certificate', 'Policy', 'Other'])->default('Other');
            $table->string('file_path')->nullable();
            $table->unsignedInteger('file_size')->nullable(); // bytes
            $table->enum('status', ['Active', 'Pending'])->default('Pending');
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('category', ['Compliance', 'Development', 'Soft Skills', 'Professional']);
            $table->string('instructor');
            $table->string('duration')->nullable();
            $table->enum('status', ['Active', 'Draft'])->default('Draft');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('training_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_program_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('progress')->default(0);
            $table->enum('status', ['Not Started', 'In Progress', 'Completed'])->default('Not Started');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'training_program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_enrollments');
        Schema::dropIfExists('training_programs');
    }
};

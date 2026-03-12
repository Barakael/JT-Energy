<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_job_id')->constrained('hr_jobs')->cascadeOnDelete();
            $table->string('title');
            $table->date('scheduled_date');
            $table->time('scheduled_time')->nullable();
            $table->string('venue')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['Scheduled', 'In Progress', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Pivot table: which employees are interviewers for which interview
        Schema::create('interview_interviewer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['interview_id', 'user_id']);
        });

        Schema::create('interviewees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('status', ['Pending', 'Interviewed', 'Selected', 'Rejected'])->default('Pending');
            $table->timestamps();
        });

        Schema::create('interview_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_id')->constrained()->cascadeOnDelete();
            $table->foreignId('interviewee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('interviewer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('marks'); // 1-10
            $table->text('comments')->nullable();
            $table->enum('recommendation', ['Strong Yes', 'Yes', 'Neutral', 'No', 'Strong No'])->default('Neutral');
            $table->timestamps();
            $table->unique(['interview_id', 'interviewee_id', 'interviewer_id'], 'feedback_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_feedback');
        Schema::dropIfExists('interviewees');
        Schema::dropIfExists('interview_interviewer');
        Schema::dropIfExists('interviews');
    }
};

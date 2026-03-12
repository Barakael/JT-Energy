<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->enum('type', ['Policy', 'Rule', 'Announcement', 'Instruction'])->default('Announcement');
            $table->enum('priority', ['Normal', 'Important', 'Urgent'])->default('Normal');
            $table->enum('target_type', ['All', 'Selected'])->default('All');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('policy_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('policy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->unique(['policy_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_recipients');
        Schema::dropIfExists('policies');
    }
};

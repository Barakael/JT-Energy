<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_programs', function (Blueprint $table) {
            $table->string('venue')->nullable()->after('description');
            $table->date('start_date')->nullable()->after('venue');
            $table->date('end_date')->nullable()->after('start_date');
            $table->time('start_time')->nullable()->after('end_date');
            $table->time('end_time')->nullable()->after('start_time');
            $table->string('mode')->default('Offline')->after('end_time');
            $table->unsignedInteger('max_capacity')->nullable()->after('mode');
        });
    }

    public function down(): void
    {
        Schema::table('training_programs', function (Blueprint $table) {
            $table->dropColumn(['venue', 'start_date', 'end_date', 'start_time', 'end_time', 'mode', 'max_capacity']);
        });
    }
};

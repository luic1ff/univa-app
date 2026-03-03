<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_lesson_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_lesson_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('action', 30); // cancelled | rescheduled | modified
            $table->time('override_starts_at')->nullable();
            $table->time('override_ends_at')->nullable();
            $table->string('override_location_text')->nullable();
            $table->string('override_teacher')->nullable();
            $table->foreignId('override_subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['schedule_lesson_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_lesson_exceptions');
    }
};

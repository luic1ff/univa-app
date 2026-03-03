<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 1=Mon … 7=Sun
            $table->time('starts_at');
            $table->time('ends_at');
            $table->foreignId('lesson_type_id')->constrained();
            $table->foreignId('delivery_mode_id')->constrained();
            $table->string('location_text')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('recurrence_rule_id')->constrained();
            $table->date('active_from');
            $table->date('active_to')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'weekday']);
            $table->index(['user_id', 'active_from', 'active_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_lessons');
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScheduleDictionarySeeder extends Seeder
{
    public function run(): void
    {
        // ------------------------------------------------------------------
        // lesson_types
        // ------------------------------------------------------------------
        $lessonTypes = [
            ['code' => 'lecture',      'name' => 'Лекція',          'color' => '#6366f1'],
            ['code' => 'practice',     'name' => 'Практична',       'color' => '#10b981'],
            ['code' => 'lab',          'name' => 'Лабораторна',     'color' => '#f59e0b'],
            ['code' => 'seminar',      'name' => 'Семінар',         'color' => '#8b5cf6'],
            ['code' => 'consultation', 'name' => 'Консультація',    'color' => '#06b6d4'],
        ];

        foreach ($lessonTypes as $row) {
            DB::table('lesson_types')->updateOrInsert(
                ['code' => $row['code']],
                array_merge($row, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ------------------------------------------------------------------
        // delivery_modes
        // ------------------------------------------------------------------
        $deliveryModes = [
            ['code' => 'offline', 'name' => 'Офлайн'],
            ['code' => 'online',  'name' => 'Онлайн'],
            ['code' => 'hybrid',  'name' => 'Змішаний'],
        ];

        foreach ($deliveryModes as $row) {
            DB::table('delivery_modes')->updateOrInsert(
                ['code' => $row['code']],
                array_merge($row, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ------------------------------------------------------------------
        // exam_types
        // ------------------------------------------------------------------
        $examTypes = [
            ['code' => 'exam',        'name' => 'Іспит'],
            ['code' => 'credit',      'name' => 'Залік'],
            ['code' => 'module_test', 'name' => 'Модульна контрольна'],
            ['code' => 'defense',     'name' => 'Захист'],
        ];

        foreach ($examTypes as $row) {
            DB::table('exam_types')->updateOrInsert(
                ['code' => $row['code']],
                array_merge($row, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ------------------------------------------------------------------
        // recurrence_rules
        // ------------------------------------------------------------------
        $recurrenceRules = [
            ['code' => 'weekly',        'name' => 'Щотижня',              'meta' => null],
            ['code' => 'biweekly_even', 'name' => 'Через тиждень (парний)', 'meta' => json_encode(['parity' => 'even'])],
            ['code' => 'biweekly_odd',  'name' => 'Через тиждень (непарний)', 'meta' => json_encode(['parity' => 'odd'])],
        ];

        foreach ($recurrenceRules as $row) {
            DB::table('recurrence_rules')->updateOrInsert(
                ['code' => $row['code']],
                array_merge($row, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}

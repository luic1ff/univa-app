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

        // ------------------------------------------------------------------
// subjects (demo data)
// ------------------------------------------------------------------

        $users = DB::table('users')->pluck('id');

        if ($users->isEmpty()) {
            return; // якщо немає користувачів — не сіємо предмети
        }

        foreach ($users as $userId) {

            $subjects = [
                ['name' => 'Вища математика',        'teacher_name' => 'Іваненко І.І.',     'color' => '#6366f1'],
                ['name' => 'Лінійна алгебра',        'teacher_name' => 'Бондаренко О.О.',   'color' => '#8b5cf6'],
                ['name' => 'Математичний аналіз',    'teacher_name' => 'Кравченко М.М.',    'color' => '#4f46e5'],
                ['name' => 'Програмування',          'teacher_name' => 'Петренко П.П.',     'color' => '#10b981'],
                ['name' => 'Алгоритми та структури даних', 'teacher_name' => 'Савченко А.А.', 'color' => '#059669'],
                ['name' => 'Об’єктно-орієнтоване програмування', 'teacher_name' => 'Романенко В.В.', 'color' => '#0ea5e9'],
                ['name' => 'Бази даних',             'teacher_name' => 'Сидоренко С.С.',    'color' => '#f59e0b'],
                ['name' => 'SQL та оптимізація запитів', 'teacher_name' => 'Гнатюк Д.Д.',   'color' => '#d97706'],
                ['name' => 'Операційні системи',     'teacher_name' => 'Мельник Ю.Ю.',      'color' => '#ef4444'],
                ['name' => 'Комп’ютерні мережі',     'teacher_name' => 'Ткаченко Л.Л.',     'color' => '#f43f5e'],
                ['name' => 'Архітектура комп’ютера', 'teacher_name' => 'Данилюк Р.Р.',      'color' => '#e11d48'],
                ['name' => 'Фізика',                 'teacher_name' => 'Коваленко К.К.',    'color' => '#f97316'],
                ['name' => 'Теорія ймовірностей',    'teacher_name' => 'Лисенко Н.Н.',      'color' => '#a855f7'],
                ['name' => 'Дискретна математика',   'teacher_name' => 'Черненко П.П.',     'color' => '#7c3aed'],
                ['name' => 'Англійська мова',        'teacher_name' => 'Мороз О.О.',        'color' => '#14b8a6'],
                ['name' => 'Soft Skills',            'teacher_name' => 'Білик Т.Т.',        'color' => '#22c55e'],
                ['name' => 'Проєктний менеджмент',   'teacher_name' => 'Яценко Є.Є.',       'color' => '#06b6d4'],
                ['name' => 'UX/UI дизайн',           'teacher_name' => 'Кузьменко І.І.',    'color' => '#ec4899'],
                ['name' => 'Мобільна розробка',      'teacher_name' => 'Шевченко В.В.',     'color' => '#3b82f6'],
                ['name' => 'Веб-розробка',           'teacher_name' => 'Гриценко А.А.',     'color' => '#2563eb'],
            ];

            foreach ($subjects as $row) {
                DB::table('subjects')->updateOrInsert(
                    [
                        'user_id' => $userId,
                        'name' => $row['name'],
                        'teacher_name' => $row['teacher_name'],
                        'color' => $row['color'],
                    ],
                    array_merge($row, [
                        'user_id' => $userId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }
}

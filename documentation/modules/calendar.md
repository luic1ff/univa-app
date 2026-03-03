# 🔹 Модуль "Розклад" — Архітектурна документація

> Версія: MVP (персональний розклад, Variant A)

---

## Призначення

Розклад — джерело правди про навчальний час студента. Показує **день/тиждень**, підтримує **повтори пар** та **одноразові події** (іспити), дає основу для дедлайнів і нагадувань.

> **Розклад ≠ календар подій.** Розклад — це "шаблон тижня + винятки", а не нескінченний список одиничних івентів.

---

## Bounded Context

### В межах модуля:
- Предмети (`subjects`) — прив'язані до user
- Пари як **правила повтору** (`schedule_lessons`)
- Одиничні події — іспити (`exam_events`)
- Винятки до правил (`schedule_lesson_exceptions`)

### Поза межами (інтеграція):
- Дедлайни/таски (окремий підмодуль)
- Нотатки/органайзер (підтягує події через API)
- Сповіщення (підписується на domain events)

---

## Сутності

### `subjects`
| Поле          | Тип        | Опис                    |
|---------------|------------|-------------------------|
| `id`          | bigint     |                         |
| `user_id`     | FK → users |                         |
| `name`        | string     | Назва предмета          |
| `teacher_name`| string?    | Ім'я викладача          |
| `color`       | string?    | HEX/CSS колір картки    |

### `schedule_lessons` (правило заняття)
| Поле                | Тип             | Опис                          |
|---------------------|-----------------|-------------------------------|
| `user_id`           | FK → users      |                               |
| `subject_id`        | FK → subjects   |                               |
| `weekday`           | tinyint (1–7)   | 1=Пн … 7=Нд (ISO)             |
| `starts_at`         | time            | Початок пари                  |
| `ends_at`           | time            | Кінець пари                   |
| `lesson_type_id`    | FK → dict       | Лекція/Практична/…            |
| `delivery_mode_id`  | FK → dict       | Офлайн/Онлайн/Змішаний        |
| `location_text`     | string?         | Аудиторія або URL             |
| `note`              | text?           |                               |
| `recurrence_rule_id`| FK → dict       | Щотижня/Через тиждень (парн.) |
| `active_from`       | date            | Початок семестру              |
| `active_to`         | date?           | Кінець семестру               |

### `schedule_lesson_exceptions` (виняток)
| Поле                    | Тип            | Опис                              |
|-------------------------|----------------|-----------------------------------|
| `schedule_lesson_id`    | FK             |                                   |
| `date`                  | date           | Конкретна дата виключення         |
| `action`                | enum           | `cancelled/rescheduled/modified`  |
| `override_starts_at`    | time?          |                                   |
| `override_ends_at`      | time?          |                                   |
| `override_location_text`| string?        |                                   |
| `override_teacher`      | string?        | Заміна викладача                  |
| `override_subject_id`   | FK?            | Заміна предмета                   |
| `reason`                | string?        |                                   |

**Unique:** `(schedule_lesson_id, date)` — один виняток на одне заняття на дату.

### `exam_events` (іспит/залік — одноразова подія)
| Поле           | Тип             | Опис           |
|----------------|-----------------|----------------|
| `user_id`      | FK → users      |                |
| `subject_id`   | FK → subjects   |                |
| `exam_type_id` | FK → dict       | Іспит/Залік/… |
| `starts_at`    | datetime        |                |
| `ends_at`      | datetime?       |                |
| `location_text`| string?         |                |
| `note`         | text?           |                |

---

## Довідники (dictionary tables)

| Таблиця            | Codes                                           |
|--------------------|-------------------------------------------------|
| `lesson_types`     | `lecture, practice, lab, seminar, consultation` |
| `delivery_modes`   | `offline, online, hybrid`                       |
| `exam_types`       | `exam, credit, module_test, defense`            |
| `recurrence_rules` | `weekly, biweekly_even, biweekly_odd`           |

---

## Логіка побудови розкладу (джерело правди)

```
GET /api/v1/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
```

1. Завантажуємо всі активні `schedule_lessons` user за діапазон
2. Для кожного дня в діапазоні — перевіряємо `occursOn()` (weekday + recurrence)
3. Накладаємо `schedule_lesson_exceptions`: `cancelled` → пропускаємо, `modified/rescheduled` → перезаписуємо поля
4. Додаємо `exam_events` за діапазон із `source: "exam"`
5. Сортуємо за `date + starts_at`

Поле `source` у відповіді: `rule | exception | exam` — фронт визначає по ньому тип картки.

---

## Правила цілісності

### Конфлікти часу
При створенні/оновленні `ScheduleLesson` перевіряємо перетин:
```
starts_at < other.ends_at AND ends_at > other.starts_at
```
у межах того ж `weekday` + `active_from/active_to` діапазону для одного user.

При конфлікті → `422 Unprocessable` з повідомленням.

---

## API

### Розклад (побудований)
```
GET  /api/v1/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
```

### Предмети
```
GET    /api/v1/subjects
POST   /api/v1/subjects
PATCH  /api/v1/subjects/{subject}
DELETE /api/v1/subjects/{subject}
```

### Правила занять
```
POST   /api/v1/schedule-lessons
PATCH  /api/v1/schedule-lessons/{lesson}
DELETE /api/v1/schedule-lessons/{lesson}
```

### Винятки
```
POST   /api/v1/schedule-lessons/{lesson}/exceptions
DELETE /api/v1/exceptions/{exception}
```

### Іспити
```
GET    /api/v1/exams?from=&to=
POST   /api/v1/exams
PATCH  /api/v1/exams/{exam}
DELETE /api/v1/exams/{exam}
```

### Довідники (публічні, кешуються)
```
GET /api/v1/dictionaries/lesson-types
GET /api/v1/dictionaries/delivery-modes
GET /api/v1/dictionaries/exam-types
GET /api/v1/dictionaries/recurrence-rules
```

---

## Авторизація

- **Модель**: персональний розклад (Variant A)
- **Policies**: `SubjectPolicy`, `ScheduleLessonPolicy`, `ExamEventPolicy` — власник може редагувати лише свої ресурси
- Словники — публічні (`/v1/dictionaries/*` без auth)

---

## Backend (Laravel)

```
app/
├── Models/Schedule/
│   ├── Subject.php
│   ├── ScheduleLesson.php          ← SoftDeletes
│   ├── ScheduleLessonException.php
│   ├── ExamEvent.php
│   ├── LessonType.php
│   ├── DeliveryMode.php
│   ├── ExamType.php
│   └── RecurrenceRule.php
├── Services/Schedule/
│   ├── ScheduleService.php         ← buildForRange + conflict check
│   ├── SubjectService.php
│   └── ExamEventService.php
├── Policies/Schedule/
│   ├── SubjectPolicy.php
│   ├── ScheduleLessonPolicy.php
│   └── ExamEventPolicy.php
├── Http/Controllers/Schedule/
│   ├── ScheduleController.php
│   ├── SubjectController.php
│   ├── ScheduleLessonController.php
│   ├── ScheduleExceptionController.php
│   ├── ExamEventController.php
│   └── DictionaryController.php
└── Http/Requests/Schedule/
    └── ...7 form requests
```

---

## Frontend (React FSD)

```
src/
├── entities/schedule/
│   ├── model/types.ts      ← TypeScript types
│   └── api/
│       ├── queries.ts      ← TanStack Query factories
│       └── hooks.ts        ← useSchedule, useCreateLesson etc.
└── pages/schedule/
    ├── schedule.page.tsx   ← Day/Week toggle + navigation
    ├── schedule.page.css
    └── components/
        ├── LessonCard.tsx
        ├── AddLessonModal.tsx
        └── AddExamModal.tsx
```

Route: `/dashboard/schedule`

---

## Domain Events (для майбутніх інтеграцій)

| Event                        | Підписники                       |
|------------------------------|----------------------------------|
| `ScheduleLessonCreated`      | Notification service, Analytics  |
| `ScheduleLessonUpdated`      | Notification service             |
| `ScheduleLessonDeleted`      | Notification service             |
| `ScheduleExceptionCreated`   | Notification service             |
| `ExamEventCreated/Updated`   | Notification service, Organizer  |

---

## MVP зріз (реалізовано)

- [x] Subjects CRUD
- [x] ScheduleLesson (weekly + biweekly)
- [x] Built schedule endpoint (from–to)
- [x] Dictionaries: lesson_types + delivery_modes + exam_types + recurrence_rules
- [x] ExamEvent
- [x] Exception: cancel + reschedule/modify
- [x] Фронтенд: тиждень/день вигляд, LessonCard, модалі додавання

## Наступні кроки

- [ ] `AddSubjectModal` (зараз subjects can be created via API)
- [ ] Кнопка скасування пари (виняток "cancelled") прямо з картки
- [ ] Групові розклади (Variant B: `group_id` + ролі)
- [ ] Domain events / Notification service
- [ ] Analytics: тижневий огляд навантаження

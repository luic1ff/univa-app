Система складається з 4 рівнів:

1. **Групи налаштувань** (`application_setting_groups`)
   → вкладки в UI (Appearance, Notifications, Privacy і т.д.)

2. **Опис налаштувань** (`application_settings`)
   → що це за налаштування (key, type, label, constraints)

3. **Можливі значення налаштування** (`application_setting_values`)
   → варіанти, які можна вибрати (dark/light/system, 0/1, uk/en/pl…)

4. **Вибір користувача** (`application_user_settings`)
   → що саме обрав конкретний юзер

---

# 2️⃣ Ролі кожної таблиці

## 🔹 application_setting_groups

Це просто категорії.

Наприклад:

* appearance
* notifications
* privacy

Вони потрібні тільки для структурування сторінки налаштувань.

---

## 🔹 application_settings

Це “опис налаштування”.

Наприклад:

* key = `appearance.theme`
* type = `enum`
* label = “Тема”
* default_setting_value_id = 5

Тобто тут зберігається:

* що це за налаштування
* до якої групи воно належить
* який тип
* яке значення дефолтне

⚠ Тут не зберігається вибір користувача.

---

## 🔹 application_setting_values

Це список дозволених значень для конкретного налаштування.

Наприклад для theme:

* system
* light
* dark

Це потрібно, щоб:

* валідовати PATCH
* не дозволити зберегти довільний текст
* будувати select/toggle на фронті

---

## 🔹 application_user_settings

Оце головне.

Це **оверрайд користувача**.

Тут зберігається:

* user_id
* application_setting_id
* application_setting_value_id

Якщо запису немає → працює default.

---

# 3️⃣ Як працює GET /settings?group_id=...

Це контролер для сторінки налаштувань.

### Алгоритм:

1. Беремо всі `application_settings` з цієї групи
2. Підтягуємо їх `values`
3. Беремо всі `application_user_settings` для цього user по цих setting_id
4. Для кожного setting:

    * якщо є user override → selectedValue = user value
    * якщо нема → selectedValue = default_setting_value_id
5. Формуємо DTO для фронта

На фронт йде:

* key
* type
* label
* options
* selectedValueId

UI може одразу показати правильний вибір.

---

# 4️⃣ Як працює PATCH /settings/{key}

Алгоритм:

1. Знаходимо `application_settings` по key
2. Перевіряємо, що передане value існує в `application_setting_values`
3. Робимо:

```php
updateOrCreate(
    user_id + application_setting_id,
    application_setting_value_id
)
```

Тобто:

* або створюємо запис
* або оновлюємо існуючий

⚠ Ми НЕ змінюємо таблицю `application_settings`.
Ми змінюємо тільки user override.

---

# 5️⃣ Як працює отримання “ефективного значення”

Коли десь у системі треба знати налаштування:

```
user_value ?? default_value
```

Тобто:

* якщо в `application_user_settings` є рядок → беремо його
* якщо немає → беремо `default_setting_value_id`

Це правило однакове для всіх типів налаштувань.

---

# 6️⃣ Чому це правильно архітектурно

✔ Дефолти централізовані
✔ Користувачі не дублюють усі значення
✔ Можна легко:

* додати нове налаштування
* змінити дефолт
* додати новий варіант
  ✔ Немає жорстко зашитих enum в коді

---

# 7️⃣ Потік при старті SPA

1. Фронт викликає `/settings?group_id=appearance`
2. Бек повертає:

    * всі appearance settings
    * з selectedValueId для user
3. Фронт:

    * застосовує theme
    * зберігає кеш
    * показує UI

---

# 8️⃣ Потік при зміні налаштування

1. Користувач змінює theme
2. Фронт:

    * одразу застосовує DOM (optimistic)
    * шле PATCH
3. Бек:

    * валідовує
    * зберігає override
4. Все

---

# 9️⃣ Важлива концепція

У тебе система працює як:

> “Каталог налаштувань” + “Оверрайд користувача”

Це дуже правильна модель.

Ти не зберігаєш повний JSON налаштувань юзера.
Ти зберігаєш тільки те, що він змінив.

---

# 🔟 Коли потрібен окремий endpoint для “мої налаштування”

Окремий endpoint (типу `/me/settings`) потрібен для:

* швидкого bootstrap UI (без group)
* застосування глобальних налаштувань (theme, language)
* фонового кешу

Але він не замінює group endpoint для сторінки налаштувань.

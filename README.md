# ComplexBar Collezione

Многостраничный сайт Expert Studio ComplexBar: тренинги, мероприятия, коллекция рецептур и сотрудничество. Проект собирается webpack'ом в статику и деплоится на GitHub Pages.

- Репозиторий: `alexeevivan/complexbar-collezione`
- Ветка деплоя: `main`
- Публикация: GitHub Pages (артефакт из `dist/`)

---

## Стек

| Слой | Технологии |
|---|---|
| Сборка | webpack 5, webpack-cli, webpack-dev-server |
| HTML | posthtml, posthtml-include, posthtml-loader, html-loader, html-webpack-plugin |
| Стили | SCSS (`sass`, `sass-loader`), `css-loader`, `mini-css-extract-plugin` |
| JS | ES-модули, jQuery 4, Swiper 14, GSAP 3 (ScrollTrigger, Observer, SplitText), FontAwesome |
| Изображения | `sharp` (конвертация в WebP), `copy-webpack-plugin`, asset modules |
| Бэкенд | Google Apps Script + Google Sheets |
| CI/CD | GitHub Actions → GitHub Pages |

Node.js: в CI используется Node 20; локально проект проверялся на Node 22.

---

## Команды

```bash
npm install       # установка зависимостей
npm start         # dev-server на http://localhost:8080 (hot reload, открывает браузер)
npm run build     # production-сборка + постобработка изображений
```

Результат сборки — папка `dist/` (в git не хранится).

`npm run build` выполняет два шага:

1. `webpack --mode production`;
2. `node scripts/optimize-images.js` — конвертирует PNG/JPG из `dist/assets/img` в WebP, удаляет оригиналы из `dist`, переписывает ссылки в HTML/CSS/JS и предупреждает о битых путях. Файлы с `favicon`, `apple-touch`, `og-image` не трогаются.

---

## Структура проекта

```text
.
├── src/
│   ├── index.js                  # entry главной страницы (main-чанк)
│   ├── calendar.js               # entry страницы мероприятий
│   ├── expert.js                 # entry страницы «О студии»
│   ├── collab.js                 # entry страницы «Сотрудничество»
│   ├── recipes.js                # entry страниц рецептов
│   ├── js/
│   │   ├── events-config.js      # конфиг мероприятий и URL Apps Script
│   │   ├── registration-form.js  # логика формы регистрации
│   │   ├── calendar-slider.js    # переключение месяцев на главной
│   │   ├── calendar-page.js      # GSAP-галерея на странице мероприятий
│   │   └── swiper-slider.js      # hero-слайдер (Swiper)
│   ├── html/
│   │   ├── index.html            # шаблон главной
│   │   ├── classes/              # шаблоны внутренних страниц
│   │   ├── recipes/              # шаблоны страниц рецептов
│   │   └── includes/             # header/footer/wrapper-* и шаблон формы
│   ├── styles/
│   │   ├── main.scss             # общие стили
│   │   ├── calendar.scss
│   │   ├── expert.scss
│   │   ├── collaboration.scss
│   │   ├── recipes.scss
│   │   ├── base/                 # null, variables, fonts
│   │   ├── components/           # стили компонентов
│   │   └── responsive/           # медиа-запросы
│   └── assets/                   # fonts, img, svg
├── scripts/
│   ├── optimize-images.js        # WebP-постобработка dist
│   └── convert-to-webp.js        # разовая конвертация исходников
├── google-apps-script.js         # код Google Apps Script (не входит в бандл)
├── webpack.config.js
└── package.json
```

---

## Страницы и чанки

| Страница | Шаблон | Чанки | Содержимое |
|---|---|---|---|
| `index.html` | `src/html/index.html` | `main` | hero-слайдер, коллекция рецептур, календарь месяцев с формами регистрации |
| `calendar.html` | `src/html/classes/calendar.html` | `main`, `calendar` | программа тренингов (аккордеон), интерактивный заголовок, GSAP-галерея |
| `expert-studio.html` | `src/html/classes/expert-studio.html` | `main`, `expert` | страница «О студии», полноэкранные секции |
| `collaboration.html` | `src/html/classes/collaboration.html` | `main`, `collaboration` | страница «Сотрудничество» (контент пока не добавлен) |
| `*-recipes.html` | `src/html/recipes/*.html` | `recipes` | списки рецептур по брендам (ODK, Pinch & Drop, Code, Osnova, Drinksome, Bubble Drops) |

HTML собирается из партиалов через `<include src="...">` (posthtml-include). Общие блоки — `includes/header.html`, `includes/footer.html`, `includes/wrapper*.html`.

---

## Стили

- `main.scss` — база и общие компоненты: header, footer, формы, hero-слайдер, responsive.
- На каждой странице подключается свой SCSS-entry (`calendar.scss`, `expert.scss` и т.д.), который импортирует `base/*`, нужные `components/*` и `responsive/*`.
- Переменные: `src/styles/base/_variables.scss` — палитра и `--index` (адаптивная единица масштаба).
- Шрифты: GTWalsheim Pro, Futura PT, Inter, Montserrat (`base/_fonts.scss`).
- Тяжёлые scroll-driven анимации галереи описаны в `components/_calendar.scss` через `@layer` и `animation-timeline`; для браузеров без поддержки включается GSAP-фолбэк (`js/calendar-page.js`).

---

## Ассеты

- `src/assets/fonts` — локальные шрифты (woff/woff2).
- `src/assets/img` — изображения; на этапе сборки копируются в `dist/assets` и конвертируются в WebP.
- `src/assets/svg` — иконки и логотипы.
- `CopyWebpackPlugin` копирует `src/assets` → `dist/assets`; шрифты и картинки дополнительно обрабатываются `asset/resource`.

---

## Регистрация на мероприятия

Поток:

1. `js/events-config.js` — список мероприятий (`eventId`, `title`, `registrationEnabled`, `googleAppsScriptUrl`).
2. Форма `.registration-form[data-event-id]` инициализируется в `js/registration-form.js`.
3. Даты берутся из `.user__course-date`; если дат несколько — показывается выбор радиокнопками.
4. Валидация: имя, email, телефон (минимум 10 цифр), согласие на обработку данных.
5. Защита: honeypot-поле `website`, блокировка повторной отправки, localStorage-cooldown 60 секунд, `clientId` для rate-limit.
6. Отправка `fetch` с `Content-Type: text/plain` (простой запрос без CORS-preflight) на URL Google Apps Script. CORS-заголовки выставляет сам Google при редиректе, вручную их задать нельзя.
7. `google-apps-script.js` валидирует данные, проверяет rate-limit по `clientId` + общий предохранитель, разрешённые `eventId`, дубликаты по телефону/email в рамках мероприятия и выбранной даты, затем пишет строку в Google Sheets.

Колонки листа `Registrations`:

| Индекс | Поле |
|---|---|
| 0 | Registration ID |
| 1 | Registration Date |
| 2 | Event ID |
| 3 | Event Date |
| 4 | Name |
| 5 | Establishment |
| 6 | Position |
| 7 | Phone |
| 8 | Email |
| 9 | Status |

---

## Деплой

`.github/workflows/deploy.yml`:

1. checkout;
2. Node 20 + `npm ci`;
3. `npm run build`;
4. загрузка `dist/` как Pages-артефакта;
5. публикация через `actions/deploy-pages`.

`output.publicPath: 'auto'` позволяет сайту работать и с корня домена, и из подпапки GitHub Pages.

---

## Исправленные несостыковки

- **CDN-дубли jQuery/Swiper убраны.** Все шаблоны больше не подключают jQuery и Swiper с CDN — используется только бандл. `js/swiper-slider.js` переведён с глобального `jQuery` на `import $ from 'jquery'`.
- **Дубли `main.scss` убраны.** `calendar.js`, `expert.js` и `collab.js` больше не импортируют `main.scss` (он приходит из общего `main`-чанка). Из page-SCSS удалены повторные `@use` базовых компонентов и общих responsive-файлов. `recipes.js` по-прежнему подключает `main.scss`, потому что страницы рецептов не грузят `main`-чанк.
- **Календарная галерея перенесена в calendar-чанк.** `js/calendar-page.js` теперь импортируется из `calendar.js`, а не из `index.js`.
- **Мёртвый Tweakpane удалён.** В `calendar-page.js` убраны создание/`dispose()` панели и биндинги; зависимость `tweakpane` удалена из `package.json`.
- **`PostHtmlIncludePlugin` удалён**, а `devServer.watchFiles` исправлен с несуществующей `public/**/*.html` на `src/html/**/*.html`.
- **Дубликаты в Apps Script учитывают дату.** `checkDuplicateRegistration` принимает `eventDate` и сравнивает нормализованную дату (`Date` или строку), поэтому один и тот же телефон/email можно зарегистрировать на разные даты одного мероприятия.
- **Комментарии колонок исправлены.** В `checkDuplicateRegistration` указаны реальные индексы: `row[2]` — Event ID, `row[3]` — Event Date, `row[7]` — Phone (колонка H), `row[8]` — Email (колонка I).
- **CORS/headers и rate-limit приведены в порядок.** Удалён неработающий параметр `headers` в `createResponse` (ContentService не умеет произвольные заголовки), `doOptions` оставлен безопасным no-op с пояснением, а rate-limit теперь считается по `clientId` из localStorage + общий предохранитель на скрипт. Apps Script не отдаёт IP клиента, поэтому лимит по IP технически невозможен.

## Оставшиеся критичные шаги

1. **Пустая страница «Сотрудничество»**: `src/html/includes/wrapper-collab.html` — файл нулевого размера, поэтому `collaboration.html` собирается без контента. Нужно добавить разметку страницы.
2. **Страницы рецептов без стилей**: `components/_recipes.scss` и `responsive/_responsive-recipes.scss` пустые, а стили `.recipes-page` / `.recipes-title` / `.recipes-content` остались только в `_calendar.scss`. Нужно перенести/продублировать эти стили в recipes-партиалы.
3. **Хрупкая форма регистрации**: `this.elements.dateGroup` и `selectedDate` могут быть `null`, если разметка изменится или у блока нет дат — возможен `TypeError` или отправка `null`. Нужны проверки существования элементов и значения по умолчанию.

## Остальные точки оптимизации

1. **`some.html` / `some.js`** — неиспользуемые демо-файлы hero-слайдера, нигде не подключены.
2. **Скрипты после `</body>`** в `index.html` и шаблонах внутренних страниц — невалидный HTML (сейчас CDN-скрипты убраны, но проверку стоит завершить).
3. **Дублирование хедера**: `wrapper-odk-syrup-recipes.html` содержит инлайн-копию `header.html` вместо `<include>`.
4. **Бургер**: инлайновый `onclick` на SVG дублирует обработчик из `index.js`; логику стоит оставить в одном месте.
5. **`swiper-slider.js`** создаёт `new Swiper('.swiper-container')` на всех страницах через `main`-чанк, даже там, где слайдера нет — добавить проверку наличия контейнера.
6. **jQuery по-прежнему попадает и в `main`, и в page-чанки**: на внутренних страницах он скачивается дважды. Можно включить `optimization.splitChunks` и вынести общий vendor-чанк.
7. **Swiper грузится на всех страницах** через `main`-чанк, хотя нужен только на главной — вынести в отдельный entry/ленивую загрузку.
8. **`console.log` / `Logger.log`** в продакшн-коде (регистрация, бургер, календарь, Apps Script) — убрать или спрятать за флагом.
9. **Нет линтера/форматтера и тестов** (ESLint, Prettier, Stylelint, Vitest/Playwright) — стиль кода смешанный (табы/пробелы, `var`/`let`, точки с запятой).
10. **Нет `.nvmrc` / `engines`** в `package.json` — версия Node фиксирована только в CI.
11. **`.DS_Store`** лежат в `src/` и корне; в git не отслеживаются, но лучше удалить.
12. **`dist/` закоммичен локально** (в git игнорируется) — не мешает, но стоит держать в чистоте.

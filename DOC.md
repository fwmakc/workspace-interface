# Command Bar UI — Документация

## Обзор

**Command Bar UI** — веб-интерфейс командной строки / лаунчер в стиле ОС. Чистый HTML/CSS/JS, без фреймворков.

---

## Архитектура

Модульная структура под глобальным объектом `App`. Каждый модуль — IIFE с публичным API.

### Инициализация (`js/bootstrap.js`)

```js
App.background.init();
App.modes.init();
App.placeholder.init();
App.emoji.init();
App.attach.init();
App.appsMenu.init();
App.mic.init();
App.speaker.init();
App.clock.init();
App.chat.init();
App.terminal.init();
App.dock.init();
App.keyboard.init();
```

### Глобальное состояние (`js/main.js`)

- `input` — `<textarea id="cmdInput">`
- `MAX_HISTORY` — лимит истории (50)
- `history` / `historyIndex` / `currentDraft` — навигация по истории
- `currentPlaceholder` — текущий placeholder
- `setMdTheme(name)` / `getMdTheme()` — переключение темы Markdown (`dark` | `light` | `dracula`)

---

## Компоненты системы

### 1. Конфигурация (`config/`)

| Файл | Назначение |
|------|-----------|
| `greetings.js` | Приветствия по времени суток, фразы для placeholder |
| `background.js` | Фон: изображение, оверлей, фильтры |
| `apps.js` | Приложения: список, иконки, bottom-экшены, хоткей меню |
| `modes.js` | Режимы: `auto`, `project`, `url`, `calc`, `notes`, `terminal`. Индивидуальные хоткеи (`Alt+1..6`) и циклический (`Shift+Space`) |

### 2. Ядро (`js/`)

#### `utils.js` — Утилиты
- `makeLongPress(el, callback)` — long-press для touch
- `createOverlay(btn, overlay)` — клик вне закрывает оверлей

#### `markdown.js` — Парсер Markdown
- `parse(text)` → HTML: заголовки, списки, цитаты, ссылки, жирный/курсив, зачёркнутый, inline/block code
- `highlightCode(code, lang)` — regex-based подсветка синтаксиса: `keyword`, `string`, `number`, `comment`, `function`, `builtin`, `operator`

#### `commands.js` — Роутер команд
- `execute(command, mode)` — калькулятор (`calc`) и терминал (`terminal`)

#### `terminal.js` — Виртуальный терминал
- In-memory ФС: `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `rm`, `clear`, `help`
- Поддержка многострочных команд (`\` в конце строки)

#### `chat.js` — Чат
- `addMessage(text, sender, extraClass)` — отправка сообщений (user/ai)
- Выделение сообщений, `Ctrl+C` для копирования выделенных
- `Alt+↑/↓` — навигация по сообщениям (возврат к input)
- `Alt+PgUp/PgDown` — постраничная навигация (только по истории, без возврата к input)
- `Alt+Home/End` — к первому/последнему сообщению
- Клик по сообщению выделяет, кнопки copy/delete на hover

#### `dock.js` — Док
- Закреплённые приложения из `localStorage` (`cbui_dockPinned`)
- Drag-and-drop: pin/unpin, reorder
- Скрывается автоматически, если пуст

#### `keyboard.js` — Клавиатура
- `Enter` — отправка, история, активация чата
- `Ctrl+↑/↓` — навигация по истории команд
- `Escape` — очистка, сброс
- `Shift+Space` — цикл режимов
- `Alt+1..6` — прямое переключение режима (только при фокусе на input)
- `Ctrl+Space` — меню приложений
- Автофокус input при любом символьном вводе

#### `modes.js` — Режимы
- `switchTo(modeId)` — ручное переключение
- `autoSwitch(text)` / `detect(text)` — авто-определение по паттерну: URL, calc, `$` → terminal, иначе → project
- `cycle()` — циклическое переключение

#### `history.js` — История
- `save(command)` — в `localStorage` (`cbui_cmdHistory`)

#### `apps.js` — Меню приложений
- Поиск, навигация стрелками, `cachedVisibleItems`, `navPos`
- Drag-and-drop для reorder
- `bottomActions` из `config/apps.js`

#### `background.js`, `placeholder.js`, `emoji.js`, `attach.js`, `mic.js`, `speaker.js`, `clock.js` — см. предыдущие версии доки.

---

## Структура DOM

```
body
├── .chat-container              ← #chatContainer (сообщения)
└── .bottom-area
    ├── .header-container
    │   └── .command-container
    │       ├── .command-bar
    │       │   ├── .bar-modes    ← #barModes
    │       │   ├── #cmdInput
    │       │   └── .bar-actions
    │       ├── .file-list        ← #fileList
    │       └── .header-panel
    │           ├── .navbar       ← #appsIcon
    │           └── .statusbar    ← speaker, mic, clock
    └── .dock-bar                 ← #dockBar (закреплённые)

.apps-menu                        ← #appsMenu
```

---

## Стили (`css/`)

| Файл | Назначение |
|------|-----------|
| `base.css` | CSS-переменные, `body`, `.glass-panel`, flex-layout |
| `command-bar.css` | Input, textarea, scrollbar input |
| `nav-bar.css` | Навбар |
| `status-bar.css` | Статус-бар |
| `apps-menu.css` | Меню приложений |
| `modes.css` | Режимы, picker |
| `emoji.css` | Пикер эмодзи |
| `attach.css` | Чипсы файлов |
| `chat.css` | Сообщения, выделение, scrollbars |
| `dock.css` | Док, контекстное меню |
| `md-themes.css` | Темы подсветки Markdown: `dark`, `.theme-light`, `.theme-dracula` |

---

## Поток данных

1. Ввод → `keyboard.js` → фокус на `cmdInput`
2. `modes.js` → авто-определение режима по тексту
3. `attach.js` / `emoji.js` — файлы и эмодзи
4. `Enter` → `history.js` + `commands.js` → `chat.js` (addMessage)
5. `calc` → вычисление, `terminal` → `terminal.js`, иначе → просто сообщение
6. Markdown рендерится через `markdown.js` с подсветкой синтаксиса
7. История, dock, placeholder, тема — в `localStorage` (префикс `cbui_`)

---

## Хранилище (localStorage, префикс `cbui_`)

| Ключ | Данные |
|------|--------|
| `cbui_cmdHistory` | История команд |
| `cbui_dockPinned` | ID закреплённых в доке |
| `cbui_appsOrder` | Порядок приложений |
| `cbui_mdTheme` | Тема Markdown (`dark` / `light` / `dracula`) |

---

## Зависимости

Нет внешних зависимостей. Все шрифты и иконки (SVG) в репозитории.

---

## Возможные направления расширения

- Реальная обработка URL/project режимов
- Интеграция Web Speech API
- Drag-and-drop файлов
- Дополнительные темы подсветки
- Плагины для режимов
- Роутинг / открытие приложений

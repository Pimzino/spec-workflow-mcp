# Руководство по разработке

Это руководство охватывает настройку среды разработки, сборку проекта, внесение вклада в код и понимание архитектуры Spec Workflow MCP.

## Предварительные требования

### Требуемое программное обеспечение

- **Node.js** 18.0 или выше
- **npm** 9.0 или выше
- **Git** для контроля версий
- **TypeScript** знание полезно

### Рекомендуемые инструменты

- **VSCode** с расширениями TypeScript
- **Chrome/Edge DevTools** для отладки панели управления
- **Postman/Insomnia** для тестирования API

## Настройка среды разработки

### 1. Клонирование репозитория

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Установка зависимостей

```bash
npm install
```

Это устанавливает:
- MCP SDK
- TypeScript и инструменты сборки
- Express для сервера панели управления
- Библиотеки WebSocket
- Фреймворки для тестирования

### 3. Сборка проекта

```bash
npm run build
```

Это компилирует файлы TypeScript в JavaScript в каталоге `dist/`.

## Команды разработки

### Основные команды

| Команда | Описание |
|---------|-------------|
| `npm run dev` | Запустить в режиме разработки с автоперезагрузкой |
| `npm run build` | Собрать производственный пакет |
| `npm start` | Запустить производственный сервер |
| `npm test` | Запустить набор тестов |
| `npm run clean` | Удалить артефакты сборки |
| `npm run lint` | Запустить линтер кода |
| `npm run format` | Форматировать код с помощью Prettier |

### Режим разработки

```bash
npm run dev
```

Функции:
- Автоматическая перекомпиляция при изменении файлов
- Горячая перезагрузка для панели управления
- Подробные сообщения об ошибках
- Карты источников для отладки

### Сборка для продакшена

```bash
npm run clean && npm run build
```

Оптимизации:
- Минифицированный JavaScript
- Оптимизированный размер пакета
- Обработка ошибок продакшена
- Улучшения производительности

## Структура проекта

```
spec-workflow-mcp/
├── src/                    # Исходный код
│   ├── index.ts           # Точка входа сервера MCP
│   ├── server.ts          # Сервер панели управления
│   ├── tools/             # Реализации инструментов MCP
│   ├── prompts/           # Шаблоны запросов
│   ├── utils/             # Утилитарные функции
│   └── types/             # Определения типов TypeScript
├── dist/                   # Скомпилированный JavaScript
├── dashboard/             # Файлы веб-панели управления
│   ├── index.html         # UI панели управления
│   ├── styles.css         # Стили панели управления
│   └── script.js          # JavaScript панели управления
├── vscode-extension/      # Расширение VSCode
│   ├── src/               # Исходный код расширения
│   └── package.json       # Манифест расширения
├── tests/                 # Тестовые файлы
├── docs/                  # Документация
└── package.json           # Конфигурация проекта
```

## Обзор архитектуры

### Архитектура сервера MCP

```
Client (AI) ↔ MCP Protocol ↔ Server ↔ File System
                              ↓
                          Dashboard
```

### Ключевые компоненты

#### 1. Сервер MCP (`src/index.ts`)
- Обрабатывает связь по протоколу MCP
- Обрабатывает запросы инструментов
- Управляет состоянием проекта
- Операции с файловой системой

#### 2. Сервер панели управления (`src/server.ts`)
- Обслуживает веб-панель управления
- Соединения WebSocket
- Обновления в реальном времени
- Конечные точки HTTP API

#### 3. Инструменты (`src/tools/`)
Каждый инструмент - отдельный модуль:
- Валидация входных данных
- Бизнес-логика
- Операции с файлами
- Форматирование ответов

#### 4. Запросы (`src/prompts/`)
Шаблонные строки для:
- Генерации документов
- Руководства по рабочему процессу
- Сообщений об ошибках
- Инструкций для пользователя

## Реализация новых функций

### Добавление нового инструмента

1. **Создайте файл инструмента** в `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Описание того, что делает инструмент',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Описание параметра' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Реализация инструмента
    const { param1, param2 = 0 } = params;

    // Бизнес-логика здесь

    return {
      success: true,
      data: 'Ответ инструмента'
    };
  }
};
```

2. **Зарегистрируйте в index** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Добавьте на сервер** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Добавление функций панели управления

1. **Обновите HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>Новая функция</h3>
  <button id="new-action">Действие</button>
</div>
```

2. **Добавьте JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Логика функции
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Обработайте на сервере** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Обработка нового действия
  }
});
```

## Тестирование

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить конкретный тестовый файл
npm test -- src/tools/my-tool.test.ts

# Запустить с покрытием
npm run test:coverage

# Режим наблюдения
npm run test:watch
```

### Написание тестов

Создавайте тестовые файлы рядом с исходными файлами:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('должен правильно обрабатывать входные данные', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('должен обрабатывать ошибки', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Интеграционное тестирование

Тестируйте полные рабочие процессы:

```typescript
// tests/integration/workflow.test.ts
describe('Полный рабочий процесс', () => {
  it('должен создать спецификацию от начала до конца', async () => {
    // Создать требования
    // Утвердить требования
    // Создать дизайн
    // Утвердить дизайн
    // Создать задачи
    // Проверить структуру
  });
});
```

## Отладка

### Отладка сервера MCP

1. **Добавьте вывод отладки**:

```typescript
console.error('[DEBUG]', 'Вызван инструмент:', toolName, params);
```

2. **Используйте отладчик VSCode**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/path/to/test/project"],
  "console": "integratedTerminal"
}
```

### Отладка панели управления

1. **Инструменты разработчика браузера**:
   - Откройте панель управления в браузере
   - Нажмите F12 для DevTools
   - Проверьте консоль на наличие ошибок
   - Мониторьте вкладку Network для WebSocket

2. **Добавьте логирование**:

```javascript
console.log('Сообщение WebSocket:', message);
console.log('Обновление состояния:', newState);
```

## Стиль кода и стандарты

### Рекомендации TypeScript

- Используйте строгий режим
- Определяйте интерфейсы для структур данных
- Избегайте типа `any`
- Используйте async/await вместо колбэков

### Организация файлов

- Один компонент на файл
- Группируйте связанную функциональность
- Понятные соглашения об именовании
- Подробные комментарии

### Соглашения об именовании

- **Файлы**: kebab-case (`my-tool.ts`)
- **Классы**: PascalCase (`SpecManager`)
- **Функции**: camelCase (`createSpec`)
- **Константы**: UPPER_SNAKE (`MAX_RETRIES`)

## Внесение вклада

### Процесс внесения вклада

1. **Форкните репозиторий**
2. **Создайте ветку функции**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Внесите изменения**
4. **Напишите тесты**
5. **Запустите тесты и линтер**:
   ```bash
   npm test
   npm run lint
   ```
6. **Зафиксируйте изменения**:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **Отправьте ветку**:
   ```bash
   git push origin feature/my-feature
   ```
8. **Создайте Pull Request**

### Формат сообщений коммитов

Следуйте conventional commits:

- `feat:` Новая функция
- `fix:` Исправление ошибки
- `docs:` Документация
- `style:` Форматирование
- `refactor:` Реструктуризация кода
- `test:` Тестирование
- `chore:` Обслуживание

Примеры:
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### Рекомендации по Pull Request

- Понятное описание
- Ссылка на связанные проблемы
- Включите скриншоты для изменений UI
- Убедитесь, что все тесты проходят
- Обновите документацию

## Публикация

### Пакет NPM

1. **Обновите версию**:
   ```bash
   npm version patch|minor|major
   ```

2. **Соберите пакет**:
   ```bash
   npm run build
   ```

3. **Опубликуйте**:
   ```bash
   npm publish
   ```

### Расширение VSCode

1. **Обновите версию расширения** в `vscode-extension/package.json`

2. **Соберите расширение**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Опубликуйте на marketplace**:
   ```bash
   vsce publish
   ```

## Оптимизация производительности

### Производительность сервера

- Используйте кэширование для чтения файлов
- Реализуйте debouncing для наблюдателей файлов
- Оптимизируйте пакетирование сообщений WebSocket
- Ленивая загрузка больших документов

### Производительность панели управления

- Минимизируйте обновления DOM
- Используйте виртуальную прокрутку для длинных списков
- Реализуйте прогрессивный рендеринг
- Оптимизируйте переподключение WebSocket

## Соображения безопасности

### Валидация входных данных

Всегда проверяйте входные данные инструментов:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Неверное имя спецификации');
}

// Санитизация путей к файлам
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Неверный путь');
}
```

### Безопасность файловой системы

- Ограничьте операции каталогом проекта
- Проверяйте все пути к файлам
- Используйте безопасные операции с файлами
- Реализуйте проверки разрешений

## Устранение проблем разработки

### Распространенные ошибки сборки

| Ошибка | Решение |
|-------|----------|
| Ошибки TypeScript | Запустите `npm run build` для просмотра подробных ошибок |
| Модуль не найден | Проверьте импорты и запустите `npm install` |
| Порт уже используется | Измените порт или завершите существующий процесс |
| Не удалось подключение WebSocket | Проверьте, что сервер запущен и порт правильный |

### Советы по разработке

1. **Используйте строгий режим TypeScript** для лучшей типобезопасности
2. **Включите карты источников** для упрощения отладки
3. **Используйте nodemon** для автоперезапуска во время разработки
4. **Тестируйте операции с файлами** в изолированном каталоге
5. **Мониторьте производительность** с помощью Chrome DevTools

## Ресурсы

- [Документация MCP SDK](https://github.com/anthropics/mcp-sdk)
- [Руководство по TypeScript](https://www.typescriptlang.org/docs/)
- [Лучшие практики Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [API расширений VSCode](https://code.visualstudio.com/api)

## Связанная документация

- [Руководство по конфигурации](CONFIGURATION.ru.md) - Конфигурация сервера
- [Руководство пользователя](USER-GUIDE.ru.md) - Использование сервера
- [Справочник инструментов](TOOLS-REFERENCE.ru.md) - Документация по инструментам
- [Устранение неполадок](TROUBLESHOOTING.ru.md) - Распространенные проблемы

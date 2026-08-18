# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

Сервер Model Context Protocol (MCP) для структурированной разработки на основе спецификаций с панелью управления в реальном времени и расширением для VSCode.

## ☕ Поддержите этот проект

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 Демонстрация

### 🔄 Система утверждения в действии
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*Посмотрите, как работает система утверждения: создание документов, запрос утверждения через панель управления, предоставление обратной связи и отслеживание ревизий.*

### 📊 Панель управления и управление спецификациями
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Изучите панель управления в реальном времени: просмотр спецификаций, отслеживание прогресса, навигация по документам и мониторинг рабочего процесса разработки.*

## ✨ Ключевые возможности

- **Структурированный рабочий процесс разработки** - Последовательное создание спецификаций (Требования → Дизайн → Задачи)
- **Веб-панель управления в реальном времени** - Мониторинг спецификаций, задач и прогресса с обновлениями в реальном времени
- **Расширение для VSCode** - Интегрированная боковая панель для пользователей VSCode
- **Процесс утверждения** - Полный процесс утверждения с ревизиями
- **Отслеживание прогресса задач** - Визуальные индикаторы прогресса и детальный статус
- **Журналы реализации** - Логи с возможностью поиска всех реализаций задач со статистикой кода
- **Многоязычная поддержка** - Доступно на 11 языках

## 🌍 Поддерживаемые языки

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Быстрый старт

### Шаг 1: Добавьте в ваш AI инструмент

Добавьте в конфигурацию MCP (см. настройку для конкретного клиента ниже):

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

### Шаг 2: Выберите интерфейс

**Вариант A: Веб-панель управления** (Требуется для пользователей CLI)
Запустите панель управления (по умолчанию работает на порту 5000):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

Панель управления будет доступна по адресу: http://localhost:5000

> **Примечание:** Требуется только один экземпляр панели управления. Все ваши проекты будут подключаться к одной панели.

**Вариант B: Расширение для VSCode** (Рекомендуется для пользователей VSCode)

Установите [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) из магазина VSCode.

## 📝 Как использовать

Просто упомяните spec-workflow в своем разговоре:

- **"Создай спецификацию для аутентификации пользователей"** - Создает полный рабочий процесс спецификации
- **"Покажи мои спецификации"** - Отображает все спецификации и их статус
- **"Выполни задачу 1.2 в спецификации user-auth"** - Запускает конкретную задачу

[Больше примеров →](docs/PROMPTING-GUIDE.ru.md)

## 🔧 Настройка MCP клиента

<details>
<summary><strong>Augment Code</strong></summary>

Настройте в параметрах Augment:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Добавьте в конфигурацию MCP:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**Важные замечания:**
- Флаг `-y` пропускает запросы npm для более плавной установки
- Разделитель `--` гарантирует, что путь передается скрипту spec-workflow, а не npx
- Замените `/path/to/your/project` на фактический путь к каталогу вашего проекта

**Альтернатива для Windows (если вышеуказанное не работает):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Добавьте в `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

> **Важно:** Запустите панель управления отдельно с флагом `--dashboard` перед запуском сервера MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Добавьте в конфигурацию MCP сервера:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Добавьте в конфигурацию Continue:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Добавьте в настройки Cursor (`settings.json`):
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Добавьте в файл конфигурации `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"],
      "enabled": true
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Добавьте в файл конфигурации `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex</strong></summary>

Добавьте в файл конфигурации `~/.codex/config.toml`:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Развертывание Docker

Запустите панель управления в контейнере Docker для изолированного развертывания:

```bash
# Использование Docker Compose (рекомендуется)
cd containers
docker-compose up --build

# Или использование Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

Панель управления будет доступна по адресу: http://localhost:5000

[См. руководство по настройке Docker →](containers/README.md)

## 🔒 Изолированные среды

Для изолированных сред (например, Codex CLI с `sandbox_mode=workspace-write`), где `$HOME` доступен только для чтения, используйте переменную окружения `SPEC_WORKFLOW_HOME` для перенаправления глобальных файлов состояния в доступную для записи папку:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[См. руководство по конфигурации →](docs/CONFIGURATION.ru.md#environment-variables)

## 📚 Документация

- [Руководство по конфигурации](docs/CONFIGURATION.ru.md) - Параметры командной строки, конфигурационные файлы
- [Руководство пользователя](docs/USER-GUIDE.ru.md) - Подробные примеры использования
- [Процесс рабочего процесса](docs/WORKFLOW.ru.md) - Рабочий процесс разработки и лучшие практики
- [Руководство по интерфейсам](docs/INTERFACES.ru.md) - Подробности о панели управления и расширении VSCode
- [Руководство по запросам](docs/PROMPTING-GUIDE.ru.md) - Расширенные примеры запросов
- [Справочник инструментов](docs/TOOLS-REFERENCE.ru.md) - Полная документация по инструментам
- [Разработка](docs/DEVELOPMENT.ru.md) - Участие в разработке и настройка окружения
- [Устранение неполадок](docs/TROUBLESHOOTING.ru.md) - Распространенные проблемы и решения

## 📁 Структура проекта

```
your-project/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Разработка

```bash
# Установить зависимости
npm install

# Собрать проект
npm run build

# Запустить в режиме разработки
npm run dev
```

[См. руководство по разработке →](docs/DEVELOPMENT.ru.md)

## 📄 Лицензия

GPL-3.0

## ⭐ История звезд

<a href="https://star-history.dera.page/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>

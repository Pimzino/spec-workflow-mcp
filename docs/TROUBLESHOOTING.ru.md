# Руководство по устранению неполадок

Это руководство поможет вам решить распространенные проблемы с Spec Workflow MCP.

## Быстрая диагностика

### Проверка установки
```bash
# Проверьте доступность npm пакета
npx -y @pimzino/spec-workflow-mcp@latest --help

# Проверьте, что вы в правильном каталоге
pwd  # или 'cd' на Windows

# Проверьте наличие каталога .spec-workflow
ls -la .spec-workflow  # или 'dir .spec-workflow' на Windows
```

### Проверка сервисов
```bash
# Тест сервера MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# Тест панели управления
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Проверка доступности порта
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Распространенные проблемы и решения

## Проблемы установки

### Пакет NPM не найден

**Ошибка**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Решения**:
1. Проверьте подключение к интернету
2. Очистите кэш npm:
   ```bash
   npm cache clean --force
   ```
3. Попробуйте без тега версии:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. Установите глобально сначала:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### Отказано в доступе

**Ошибка**: `EACCES: permission denied`

**Решения**:
1. **macOS/Linux**: Используйте правильные разрешения npm:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Запустите от имени администратора или исправьте разрешения npm:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Используйте npx с флагом -y:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## Проблемы сервера MCP

### Сервер не запускается

**Ошибка**: `Failed to start MCP server`

**Решения**:
1. Проверьте версию Node.js:
   ```bash
   node --version  # Должна быть 18.0 или выше
   ```
2. Проверьте существование пути проекта:
   ```bash
   ls -la /path/to/project
   ```
3. Проверьте конфликтующие процессы:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Попробуйте с абсолютным путем:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP не подключается к AI инструменту

**Ошибка**: `MCP server unreachable` или `Connection refused`

**Решения**:

1. **Claude Desktop**: Проверьте конфигурационный файл:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/absolute/path/to/project"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Проверьте настройку:
   ```bash
   claude mcp list  # Проверьте, указан ли spec-workflow
   claude mcp remove spec-workflow  # Удалите если существует
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **Проблемы с путем**: Убедитесь, что путь абсолютный и существует:
   - ❌ `~/project` или `./project`
   - ✅ `/Users/name/project` или `C:\Users\name\project`

### Инструменты недоступны

**Ошибка**: `Tool 'spec-workflow' not found`

**Решения**:
1. Полностью перезапустите ваш AI инструмент
2. Проверьте, что сервер MCP запущен (ищите процесс)
3. Проверьте правильность сохранения конфигурации
4. Попробуйте упомянуть инструмент явно: "Используй spec-workflow для создания спецификации"

## Проблемы панели управления

### Панель управления не загружается

**Ошибка**: `Cannot connect to dashboard` или пустая страница

**Решения**:
1. Проверьте, что панель управления запущена:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. Проверьте URL в браузере (обратите внимание на порт):
   ```
   http://localhost:3000  # Или какой порт показан
   ```
3. Попробуйте другой браузер или режим инкогнито
4. Проверьте консоль браузера на наличие ошибок (F12 → Console)
5. Временно отключите расширения браузера

### Порт уже используется

**Ошибка**: `Error: listen EADDRINUSE: address already in use :::3000`

**Решения**:
1. Используйте другой порт:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. Найдите и завершите процесс, использующий порт:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Используйте эфемерный порт (пропустите флаг --port):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### Не удалось подключение WebSocket

**Ошибка**: `WebSocket connection lost` или обновления в реальном времени не работают

**Решения**:
1. Обновите страницу браузера
2. Проверьте, не блокирует ли брандмауэр WebSocket
3. Проверьте, что панель управления и сервер MCP запущены из одного проекта
4. Проверьте консоль браузера на конкретные ошибки
5. Попробуйте другую сеть (если в корпоративной сети)

### Панель управления не обновляется

**Симптомы**: Изменения не отражаются в реальном времени

**Решения**:
1. Жесткое обновление браузера (Ctrl+Shift+R или Cmd+Shift+R)
2. Очистите кэш браузера
3. Проверьте статус соединения WebSocket (должен показывать зеленый)
4. Проверьте работу наблюдателей файловой системы:
   ```bash
   # Создайте тестовый файл в проекте
   touch .spec-workflow/test.md
   # Должно вызвать обновление на панели управления
   ```

## Проблемы системы утверждения

### Утверждения не отображаются

**Ошибка**: Нет уведомлений об утверждении на панели управления

**Решения**:
1. Убедитесь, что панель управления запущена вместе с сервером MCP:
   ```bash
   # Запустите оба отдельно
   # Терминал 1: Запустить панель управления
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # Терминал 2: Запустить сервер MCP
   npx -y @pimzino/spec-workflow-mcp@latest /path
   ```
2. Проверьте существование каталога утверждений:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Вручную вызовите запрос утверждения через AI

### Не могу утвердить документы

**Ошибка**: Кнопки утверждения не работают

**Решения**:
1. Проверьте консоль браузера на JavaScript ошибки
2. Проверьте, что вы на правильной странице спецификации
3. Убедитесь, что документ имеет статус ожидающего утверждения
4. Попробуйте использовать расширение VSCode вместо этого (если доступно)

## Проблемы файловой системы

### Файлы спецификаций не создаются

**Ошибка**: Документы спецификаций не появляются в файловой системе

**Решения**:
1. Проверьте разрешения на запись:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Проверьте правильный рабочий каталог:
   ```bash
   pwd  # Должен быть корень вашего проекта
   ```
3. Ищите скрытые файлы:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Проверьте, не блокирует ли антивирус создание файлов

### Отказано в доступе к файлам

**Ошибка**: `EACCES` или `Permission denied` при создании спецификаций

**Решения**:
1. Исправьте разрешения каталога:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Проверьте владельца файла:
   ```bash
   ls -la .spec-workflow
   # Должен принадлежать вашему пользователю
   ```
3. Запускайте из каталога, которым вы владеете (не системные каталоги)

## Проблемы расширения VSCode

### Расширение не загружается

**Ошибка**: Значок Spec Workflow не появляется на панели активности

**Решения**:
1. Проверьте установку расширения:
   - Откройте расширения (Ctrl+Shift+X)
   - Найдите "Spec Workflow MCP"
   - Проверьте, установлено ли и включено
2. Перезагрузите окно VSCode:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Проверьте вывод расширения:
   - View → Output → Выберите "Spec Workflow" из выпадающего списка
4. Убедитесь, что в проекте есть каталог `.spec-workflow`

### Команды расширения не работают

**Ошибка**: Команды не выполняются или показывают ошибки

**Решения**:
1. Откройте папку проекта, содержащую `.spec-workflow`
2. Проверьте, что VSCode использует правильное рабочее пространство
3. Просмотрите журналы расширения для конкретных ошибок
4. Попробуйте переустановить расширение:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Проблемы конфигурации

### Конфигурационный файл не загружается

**Ошибка**: Настройки в config.toml не применяются

**Решения**:
1. Проверьте синтаксис TOML:
   ```bash
   # Установите валидатор TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Проверьте расположение файла:
   - По умолчанию: `.spec-workflow/config.toml`
   - Пользовательский: Используйте флаг `--config`
3. Убедитесь в отсутствии синтаксических ошибок:
   ```toml
   # Правильно
   port = 3000
   lang = "en"

   # Неправильно
   port: 3000  # Должно использовать = не :
   lang = en   # Должно быть в кавычках
   ```

### Аргументы командной строки не работают

**Ошибка**: Флаги типа `--port` игнорируются

**Решения**:
1. Проверьте порядок аргументов:
   ```bash
   # Правильно
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # Неправильно
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. Убедитесь, что значения флагов действительны:
   - Порт: 1024-65535
   - Язык: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Используйте `--help` для просмотра всех опций

## Проблемы производительности

### Медленное время отклика

**Симптомы**: Панель управления или инструменты отвечают медленно

**Решения**:
1. Проверьте системные ресурсы:
   ```bash
   # Использование CPU и памяти
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Уменьшите наблюдателей файлов в больших проектах:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Очистите старые записи утверждений:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Используйте конкретные имена спецификаций вместо перечисления всех

### Высокое использование памяти

**Решения**:
1. Периодически перезапускайте сервисы
2. Ограничьте частоту обновления панели управления:
   ```json
   // Настройки VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Архивируйте завершенные спецификации
4. Очистите кэш браузера для панели управления

## Проблемы сети

### За корпоративным прокси

**Решения**:
1. Настройте прокси npm:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Используйте локальную установку:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### Брандмауэр блокирует соединения

**Решения**:
1. Разрешите Node.js через брандмауэр
2. Используйте localhost вместо 0.0.0.0
3. Настройте правила для конкретных портов
4. Попробуйте другие диапазоны портов

## Платформо-специфичные проблемы

### Windows

#### Проблемы формата пути
**Ошибка**: `Invalid path` или путь не найден

**Решения**:
```bash
# Используйте прямые слэши
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# Или экранированные обратные слэши
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### Политика выполнения PowerShell
**Ошибка**: `cannot be loaded because running scripts is disabled`

**Решения**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Блокировка Gatekeeper
**Ошибка**: `cannot be opened because the developer cannot be verified`

**Решения**:
1. System Preferences → Security & Privacy → Allow
2. Или удалите карантин:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### Отсутствующие зависимости
**Ошибка**: `shared library not found`

**Решения**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Получение помощи

### Диагностическая информация

При сообщении о проблемах включите:

1. **Информация о системе**:
   ```bash
   node --version
   npm --version
   uname -a  # или 'ver' на Windows
   ```

2. **Сообщения об ошибках**:
   - Полный текст ошибки
   - Скриншот если визуальная проблема
   - Логи консоли браузера

3. **Конфигурация**:
   - Конфигурация клиента MCP
   - Содержимое config.toml
   - Использованная командная строка

4. **Шаги воспроизведения**:
   - Точные команды, выполненные
   - Ожидаемое поведение
   - Фактическое поведение

### Каналы поддержки

1. **GitHub Issues**: [Создать проблему](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Документация**: Проверьте другие руководства в `/docs`
3. **Сообщество**: Обсуждения и вопросы-ответы

### Режим отладки

Включите подробное логирование:

```bash
# Установите переменную окружения
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Запустите с выводом отладки
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## Советы по предотвращению

### Лучшие практики

1. **Всегда используйте абсолютные пути** в конфигурациях
2. **Держите Node.js обновленным** (требуется v18+)
3. **Запускайте из корневого каталога проекта**
4. **Используйте --help** для проверки опций
5. **Тестируйте в чистой среде** при возникновении проблем
6. **Проверяйте логи** перед предположением о сбое
7. **Регулярно делайте резервные копии** каталога .spec-workflow

### Регулярное обслуживание

1. Очищайте старые утверждения ежемесячно
2. Архивируйте завершенные спецификации
3. Регулярно обновляйте npm пакеты
4. Мониторьте дисковое пространство для логов
5. Перезапускайте сервисы после обновлений

## Связанная документация

- [Руководство по конфигурации](CONFIGURATION.ru.md) - Детальные параметры конфигурации
- [Руководство пользователя](USER-GUIDE.ru.md) - Общие инструкции по использованию
- [Руководство по разработке](DEVELOPMENT.ru.md) - Для внесения исправлений
- [Руководство по интерфейсам](INTERFACES.ru.md) - Подробности панели управления и расширения

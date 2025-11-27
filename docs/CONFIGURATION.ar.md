# دليل التكوين

يغطي هذا الدليل جميع خيارات التكوين لـ Spec Workflow MCP.

## خيارات سطر الأوامر

### الاستخدام الأساسي

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [options]
```

### الخيارات المتاحة

| الخيار | الوصف | مثال |
|--------|-------------|---------|
| `--help` | عرض معلومات الاستخدام الشاملة | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | تشغيل وضع لوحة التحكم فقط (المنفذ الافتراضي: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <number>` | تحديد منفذ مخصص للوحة التحكم (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### ملاحظات مهمة

- **مثيل واحد للوحة التحكم**: تعمل لوحة تحكم واحدة فقط في كل مرة. جميع خوادم MCP تتصل بنفس لوحة التحكم.
- **المنفذ الافتراضي**: تستخدم لوحة التحكم المنفذ 5000 بشكل افتراضي. استخدم `--port` فقط إذا كان 5000 غير متاح.
- **لوحة تحكم منفصلة**: قم دائمًا بتشغيل لوحة التحكم بشكل منفصل عن خوادم MCP.

## أمثلة الاستخدام

### سير العمل النموذجي

1. **ابدأ لوحة التحكم** (قم بذلك أولاً، مرة واحدة فقط):
```bash
# يستخدم المنفذ الافتراضي 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **ابدأ خوادم MCP** (واحد لكل مشروع، في نوافذ طرفية منفصلة):
```bash
# المشروع 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# المشروع 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# المشروع 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

ستظهر جميع المشاريع في لوحة التحكم على http://localhost:5000

### لوحة تحكم مع منفذ مخصص

استخدم منفذًا مخصصًا فقط إذا كان المنفذ 5000 غير متاح:

```bash
# ابدأ لوحة التحكم على المنفذ 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## متغيرات البيئة

### SPEC_WORKFLOW_HOME

تجاوز دليل الحالة العامة الافتراضي (`~/.spec-workflow-mcp`). هذا مفيد للبيئات المعزولة حيث يكون `$HOME` للقراءة فقط.

| المتغير | الافتراضي | الوصف |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | دليل ملفات الحالة العامة |

**الملفات المخزنة في هذا الدليل:**
- `activeProjects.json` - سجل المشاريع
- `activeSession.json` - معلومات جلسة لوحة التحكم
- `settings.json` - الإعدادات العامة
- `job-execution-history.json` - سجل تنفيذ المهام
- `migration.log` - تتبع ترحيل سجل التنفيذ

**أمثلة الاستخدام:**

```bash
# مسار مطلق
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# مسار نسبي (يُحل مقابل دليل العمل الحالي)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# لوضع لوحة التحكم
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**البيئات المعزولة (مثل Codex CLI):**

عند التشغيل في بيئات معزولة مثل Codex CLI مع `sandbox_mode=workspace-write`، قم بتعيين `SPEC_WORKFLOW_HOME` إلى موقع قابل للكتابة داخل مساحة العمل الخاصة بك:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## إدارة جلسة لوحة التحكم

تخزن لوحة التحكم معلومات جلستها في `~/.spec-workflow-mcp/activeSession.json` (أو `$SPEC_WORKFLOW_HOME/activeSession.json` إذا تم تعيينه). هذا الملف:
- يفرض مثيل واحد للوحة التحكم
- يسمح لخوادم MCP باكتشاف لوحة التحكم قيد التشغيل
- ينظف تلقائيًا عند توقف لوحة التحكم

### فرض مثيل واحد

يمكن تشغيل لوحة تحكم واحدة فقط في أي وقت. إذا حاولت بدء لوحة تحكم ثانية:

```
Dashboard is already running at: http://localhost:5000

You can:
  1. Use the existing dashboard at: http://localhost:5000
  2. Stop it first (Ctrl+C or kill PID), then start a new one

Note: Only one dashboard instance is needed for all your projects.
```

## إدارة المنافذ

**المنفذ الافتراضي**: 5000
**المنفذ المخصص**: استخدم `--port <number>` فقط إذا كان المنفذ 5000 غير متاح

### تعارضات المنافذ

إذا كان المنفذ 5000 قيد الاستخدام بالفعل بواسطة خدمة أخرى:

```bash
Failed to start dashboard: Port 5000 is already in use.

This might be another service using port 5000.
To use a different port:
  spec-workflow-mcp --dashboard --port 8080
```

## ملف التكوين (قديم)

### الموقع الافتراضي

يبحث الخادم عن التكوين في: `<project-dir>/.spec-workflow/config.toml`

### تنسيق الملف

يستخدم التكوين تنسيق TOML. إليك مثال كامل:

```toml
# دليل المشروع (افتراضيًا الدليل الحالي)
projectDir = "/path/to/your/project"

# منفذ لوحة التحكم (1024-65535)
port = 3456

# تشغيل وضع لوحة التحكم فقط
dashboardOnly = false

# لغة الواجهة
# الخيارات: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "en"

# إشعارات صوتية (إضافة VSCode فقط)
[notifications]
enabled = true
volume = 0.5

# الإعدادات المتقدمة
[advanced]
# محاولات إعادة الاتصال بـ WebSocket
maxReconnectAttempts = 10

# إعدادات مراقب الملفات
[watcher]
enabled = true
debounceMs = 300
```

### خيارات التكوين

#### الإعدادات الأساسية

| الخيار | النوع | الافتراضي | الوصف |
|--------|------|---------|-------------|
| `projectDir` | string | الدليل الحالي | مسار دليل المشروع |
| `port` | number | مؤقت | منفذ لوحة التحكم (1024-65535) |
| `dashboardOnly` | boolean | false | تشغيل لوحة التحكم بدون خادم MCP |
| `lang` | string | "en" | لغة الواجهة |

> **ملاحظة**: تمت إزالة خيار `autoStartDashboard` في الإصدار 2.0.0. تستخدم لوحة التحكم الآن وضع متعدد المشاريع الموحد المتاح عبر علامة `--dashboard`.

#### خيارات اللغة

- `en` - الإنجليزية
- `ja` - اليابانية (日本語)
- `zh` - الصينية (中文)
- `es` - الإسبانية (Español)
- `pt` - البرتغالية (Português)
- `de` - الألمانية (Deutsch)
- `fr` - الفرنسية (Français)
- `ru` - الروسية (Русский)
- `it` - الإيطالية (Italiano)
- `ko` - الكورية (한국어)
- `ar` - العربية (العربية)

### إنشاء تكوين مخصص

1. انسخ التكوين المثالي:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. حرر التكوين:
```toml
# تكوين مشروعي
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "en"
```

3. استخدم التكوين:
```bash
# يستخدم .spec-workflow/config.toml تلقائيًا
npx -y @pimzino/spec-workflow-mcp@latest

# أو حدد صراحةً
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## أسبقية التكوين

يتم تطبيق قيم التكوين بهذا الترتيب (من الأعلى إلى الأدنى أولوية):

1. **وسائط سطر الأوامر** - لها الأولوية دائمًا
2. **ملف تكوين مخصص** - محدد مع `--config`
3. **ملف التكوين الافتراضي** - `.spec-workflow/config.toml`
4. **الافتراضيات المدمجة** - قيم احتياطية

### مثال على الأسبقية

```toml
# config.toml
port = 3000
```

```bash
# وسيط سطر الأوامر يتجاوز ملف التكوين
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# النتيجة: port = 4000 (CLI تفوز)
```

## تكوينات خاصة بالبيئة

### تكوين التطوير

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "en"

[advanced]
debugMode = true
verboseLogging = true
```

الاستخدام:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### تكوين الإنتاج

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "en"

[advanced]
debugMode = false
verboseLogging = false
```

الاستخدام:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## تكوين المنفذ

### نطاق المنفذ الصالح

يجب أن تكون المنافذ بين 1024 و 65535.

### المنافذ المؤقتة

عندما لا يتم تحديد منفذ، يختار النظام تلقائيًا منفذًا مؤقتًا متاحًا. هذا موصى به لـ:
- بيئات التطوير
- مشاريع متعددة متزامنة
- تجنب تعارضات المنافذ

### المنافذ الثابتة

استخدم منافذ ثابتة عندما تحتاج:
- عناوين URL متسقة للإشارات المرجعية
- التكامل مع أدوات أخرى
- التعاون الجماعي مع تكوينات مشتركة

### حل تعارض المنفذ

إذا كان المنفذ قيد الاستخدام بالفعل:

1. **تحقق مما يستخدم المنفذ:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **الحلول:**
   - استخدم منفذًا مختلفًا: `--port 3001`
   - أنهِ العملية التي تستخدم المنفذ
   - احذف `--port` لاستخدام منفذ مؤقت

## إعداد متعدد المشاريع

### تكوينات منفصلة

أنشئ تكوينات خاصة بالمشروع:

```bash
# المشروع أ
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# المشروع ب
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### تكوين مشترك

استخدم تكوينًا مشتركًا مع تجاوزات:

```bash
# تكوين أساسي مشترك
~/configs/spec-workflow-base.toml

# تجاوزات خاصة بالمشروع
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## تكوين إضافة VSCode

إضافة VSCode لها إعداداتها الخاصة:

1. افتح إعدادات VSCode (Cmd/Ctrl + ,)
2. ابحث عن "Spec Workflow"
3. قم بالتكوين:
   - تفضيل اللغة
   - الإشعارات الصوتية
   - رؤية الأرشيف
   - فترة التحديث التلقائي

## استكشاف أخطاء التكوين وإصلاحها

### التكوين لا يتم تحميله

1. **تحقق من موقع الملف:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **تحقق من صحة بناء جملة TOML:**
   ```bash
   # ثبت أداة TOML CLI
   npm install -g @iarna/toml

   # تحقق من الصحة
   toml .spec-workflow/config.toml
   ```

3. **تحقق من الأذونات:**
   ```bash
   # تأكد من أن الملف قابل للقراءة
   chmod 644 .spec-workflow/config.toml
   ```

### المشكلات الشائعة

| المشكلة | الحل |
|-------|----------|
| المنفذ قيد الاستخدام بالفعل | استخدم منفذًا مختلفًا أو احذف للمنفذ المؤقت |
| لم يتم العثور على ملف التكوين | تحقق من المسار واستخدم المسار المطلق إذا لزم الأمر |
| بناء جملة TOML غير صالح | تحقق من الصحة باستخدام أداة TOML |
| الإعدادات لا يتم تطبيقها | تحقق من أسبقية التكوين |

## أفضل الممارسات

1. **استخدم التحكم في الإصدار** لملفات التكوين
2. **وثق الإعدادات المخصصة** في ملف README الخاص بمشروعك
3. **استخدم منافذ مؤقتة** في التطوير
4. **احتفظ بالبيانات الحساسة** خارج ملفات التكوين
5. **أنشئ تكوينات خاصة بالبيئة**
6. **اختبر تغييرات التكوين** قبل النشر

## التوثيق ذو الصلة

- [دليل المستخدم](USER-GUIDE.md) - استخدام الخادم المُكوَّن
- [دليل الواجهات](INTERFACES.md) - إعدادات لوحة التحكم والإضافة
- [استكشاف الأخطاء وإصلاحها](TROUBLESHOOTING.md) - مشكلات التكوين الشائعة

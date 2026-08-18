# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

خادم Model Context Protocol (MCP) للتطوير المنظم القائم على المواصفات مع لوحة تحكم فورية وإضافة VSCode.

## ☕ دعم هذا المشروع

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 عرض توضيحي

### 🔄 نظام الموافقات في العمل
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*شاهد كيف يعمل نظام الموافقات: إنشاء المستندات، طلب الموافقة عبر لوحة التحكم، تقديم الملاحظات، وتتبع المراجعات.*

### 📊 لوحة التحكم وإدارة المواصفات
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*استكشف لوحة التحكم الفورية: عرض المواصفات، تتبع التقدم، التنقل في المستندات، ومراقبة سير عمل التطوير.*

## ✨ الميزات الرئيسية

- **سير عمل تطوير منظم** - إنشاء متسلسل للمواصفات (المتطلبات → التصميم → المهام)
- **لوحة تحكم ويب فورية** - مراقبة المواصفات والمهام والتقدم مع تحديثات مباشرة
- **إضافة VSCode** - تجربة لوحة تحكم متكاملة لمستخدمي VSCode
- **سير عمل الموافقات** - عملية موافقة كاملة مع المراجعات
- **تتبع تقدم المهام** - أشرطة تقدم مرئية وحالة مفصلة
- **سجلات التنفيذ** - سجلات قابلة للبحث لجميع تنفيذات المهام مع إحصائيات الكود
- **دعم متعدد اللغات** - متاح بـ 11 لغة

## 🌍 اللغات المدعومة

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 البدء السريع

### الخطوة 1: أضف إلى أداة الذكاء الاصطناعي الخاصة بك

أضف إلى تكوين MCP الخاص بك (راجع الإعداد الخاص بكل عميل أدناه):

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

### الخطوة 2: اختر واجهتك

**الخيار أ: لوحة تحكم الويب** (مطلوبة لمستخدمي CLI)
ابدأ لوحة التحكم (تعمل على المنفذ 5000 بشكل افتراضي):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

ستكون لوحة التحكم متاحة على: http://localhost:5000

> **ملاحظة:** مطلوب مثيل واحد فقط من لوحة التحكم. ستتصل جميع مشاريعك بنفس لوحة التحكم.

**الخيار ب: إضافة VSCode** (موصى بها لمستخدمي VSCode)

قم بتثبيت [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) من سوق VSCode.

## 📝 كيفية الاستخدام

ببساطة اذكر spec-workflow في محادثتك:

- **"أنشئ مواصفة لمصادقة المستخدم"** - ينشئ سير عمل كامل للمواصفة
- **"اعرض مواصفاتي"** - يعرض جميع المواصفات وحالتها
- **"نفذ المهمة 1.2 في المواصفة user-auth"** - ينفذ مهمة محددة

[شاهد المزيد من الأمثلة →](docs/PROMPTING-GUIDE.md)

## 🔧 إعداد عميل MCP

<details>
<summary><strong>Augment Code</strong></summary>

قم بالتكوين في إعدادات Augment الخاصة بك:
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

أضف إلى تكوين MCP الخاص بك:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**ملاحظات مهمة:**
- العلم `-y` يتجاوز مطالبات npm للتثبيت السلس
- الفاصل `--` يضمن تمرير المسار إلى سكريبت spec-workflow، وليس إلى npx
- استبدل `/path/to/your/project` بمسار دليل مشروعك الفعلي

**بديل لنظام Windows (إذا لم ينجح ما سبق):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

أضف إلى `claude_desktop_config.json`:
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

> **مهم:** قم بتشغيل لوحة التحكم بشكل منفصل مع `--dashboard` قبل بدء خادم MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

أضف إلى تكوين خادم MCP الخاص بك:
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

أضف إلى تكوين Continue الخاص بك:
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

أضف إلى إعدادات Cursor (`settings.json`):
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

أضف إلى ملف التكوين `opencode.json`:
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

أضف إلى ملف التكوين `~/.codeium/windsurf/mcp_config.json`:
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

أضف إلى ملف التكوين `~/.codex/config.toml`:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 النشر باستخدام Docker

قم بتشغيل لوحة التحكم في حاوية Docker للنشر المعزول:

```bash
# استخدام Docker Compose (موصى به)
cd containers
docker-compose up --build

# أو استخدام Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

ستكون لوحة التحكم متاحة على: http://localhost:5000

[راجع دليل إعداد Docker →](containers/README.md)

## 🔒 البيئات المعزولة

للبيئات المعزولة (مثل Codex CLI مع `sandbox_mode=workspace-write`) حيث يكون `$HOME` للقراءة فقط، استخدم متغير البيئة `SPEC_WORKFLOW_HOME` لإعادة توجيه ملفات الحالة العامة إلى موقع قابل للكتابة:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[راجع دليل التكوين →](docs/CONFIGURATION.md#environment-variables)

## 📚 التوثيق

- [دليل التكوين](docs/CONFIGURATION.md) - خيارات سطر الأوامر، ملفات التكوين
- [دليل المستخدم](docs/USER-GUIDE.md) - أمثلة استخدام شاملة
- [عملية سير العمل](docs/WORKFLOW.md) - سير عمل التطوير وأفضل الممارسات
- [دليل الواجهات](docs/INTERFACES.md) - تفاصيل لوحة التحكم وإضافة VSCode
- [دليل الأوامر](docs/PROMPTING-GUIDE.md) - أمثلة أوامر متقدمة
- [مرجع الأدوات](docs/TOOLS-REFERENCE.md) - توثيق الأدوات الكامل
- [التطوير](docs/DEVELOPMENT.md) - المساهمة وإعداد التطوير
- [استكشاف الأخطاء وإصلاحها](docs/TROUBLESHOOTING.md) - المشكلات الشائعة والحلول

## 📁 هيكل المشروع

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

## 🛠️ التطوير

```bash
# تثبيت التبعيات
npm install

# بناء المشروع
npm run build

# التشغيل في وضع التطوير
npm run dev
```

[راجع دليل التطوير →](docs/DEVELOPMENT.md)

## 📄 الترخيص

GPL-3.0

## ⭐ تاريخ النجوم

<a href="https://star-history.dera.page/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>

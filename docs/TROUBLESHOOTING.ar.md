# دليل استكشاف الأخطاء وإصلاحها

يساعدك هذا الدليل في حل المشكلات الشائعة مع Spec Workflow MCP.

## التشخيص السريع

### التحقق من التثبيت
```bash
# تحقق من إمكانية الوصول إلى حزمة npm
npx -y @pimzino/spec-workflow-mcp@latest --help

# تحقق من التشغيل في الدليل الصحيح
pwd  # أو 'cd' على Windows

# تحقق من وجود دليل .spec-workflow
ls -la .spec-workflow  # أو 'dir .spec-workflow' على Windows
```

### التحقق من الخدمات
```bash
# اختبر خادم MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# اختبر لوحة التحكم
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# تحقق من توفر المنفذ
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## المشكلات الشائعة والحلول

## مشكلات التثبيت

### حزمة NPM غير موجودة

**الخطأ**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**الحلول**:
1. تحقق من اتصال الإنترنت
2. امسح ذاكرة التخزين المؤقت لـ npm:
   ```bash
   npm cache clean --force
   ```
3. حاول بدون علامة الإصدار:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. ثبت عالميًا أولاً:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### رفض الإذن

**الخطأ**: `EACCES: permission denied`

**الحلول**:
1. **macOS/Linux**: استخدم أذونات npm الصحيحة:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: قم بالتشغيل كمسؤول أو أصلح أذونات npm:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. استخدم npx مع علامة -y:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## مشكلات خادم MCP

### الخادم لا يبدأ

**الخطأ**: `Failed to start MCP server`

**الحلول**:
1. تحقق من إصدار Node.js:
   ```bash
   node --version  # يجب أن يكون 18.0 أو أعلى
   ```
2. تحقق من وجود مسار المشروع:
   ```bash
   ls -la /path/to/project
   ```
3. تحقق من العمليات المتعارضة:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. حاول بمسار مطلق:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP لا يتصل بأداة الذكاء الاصطناعي

**الخطأ**: `MCP server unreachable` أو `Connection refused`

**الحلول**:

1. **Claude Desktop**: تحقق من ملف التكوين:
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

2. **Claude Code CLI**: تحقق من الإعداد:
   ```bash
   claude mcp list  # تحقق من إدراج spec-workflow
   claude mcp remove spec-workflow  # أزل إذا كان موجودًا
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **مشكلات المسار**: تأكد من أن المسار مطلق وموجود:
   - ❌ `~/project` أو `./project`
   - ✅ `/Users/name/project` أو `C:\Users\name\project`

### الأدوات غير متاحة

**الخطأ**: `Tool 'spec-workflow' not found`

**الحلول**:
1. أعد تشغيل أداة الذكاء الاصطناعي بالكامل
2. تحقق من تشغيل خادم MCP (ابحث عن العملية)
3. تحقق من حفظ التكوين بشكل صحيح
4. حاول ذكر الأداة صراحةً: "استخدم spec-workflow لإنشاء مواصفة"

## مشكلات لوحة التحكم

### لوحة التحكم لا تُحمّل

**الخطأ**: `Cannot connect to dashboard` أو صفحة فارغة

**الحلول**:
1. تحقق من بدء لوحة التحكم:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. تحقق من URL في المتصفح (لاحظ المنفذ):
   ```
   http://localhost:3000  # أو أي منفذ معروض
   ```
3. جرب متصفحًا مختلفًا أو وضع التصفح المتخفي
4. تحقق من وحدة تحكم المتصفح للأخطاء (F12 → وحدة التحكم)
5. عطّل إضافات المتصفح مؤقتًا

### المنفذ قيد الاستخدام بالفعل

**الخطأ**: `Error: listen EADDRINUSE: address already in use :::3000`

**الحلول**:
1. استخدم منفذًا مختلفًا:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. اعثر على العملية التي تستخدم المنفذ وأنهها:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. استخدم منفذًا مؤقتًا (احذف علامة --port):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### فشل اتصال WebSocket

**الخطأ**: `WebSocket connection lost` أو التحديثات الفورية لا تعمل

**الحلول**:
1. أعد تحميل صفحة المتصفح
2. تحقق من عدم حظر جدار الحماية لـ WebSocket
3. تحقق من تشغيل لوحة التحكم وخادم MCP من نفس المشروع
4. تحقق من وحدة تحكم المتصفح للأخطاء المحددة
5. جرب شبكة مختلفة (إذا كنت على شبكة شركة)

### لوحة التحكم لا تُحدّث

**الأعراض**: التغييرات لا تنعكس في الوقت الفعلي

**الحلول**:
1. تحديث قوي للمتصفح (Ctrl+Shift+R أو Cmd+Shift+R)
2. امسح ذاكرة التخزين المؤقت للمتصفح
3. تحقق من حالة اتصال WebSocket (يجب أن تظهر باللون الأخضر)
4. تحقق من عمل مراقبي نظام الملفات:
   ```bash
   # أنشئ ملف اختبار في المشروع
   touch .spec-workflow/test.md
   # يجب أن يؤدي إلى تحديث في لوحة التحكم
   ```

## مشكلات نظام الموافقة

### الموافقات لا تظهر

**الخطأ**: لا توجد إشعارات موافقة في لوحة التحكم

**الحلول**:
1. تأكد من تشغيل لوحة التحكم جنبًا إلى جنب مع خادم MCP:
   ```bash
   # قم بتشغيل كليهما بشكل منفصل
   # النافذة الطرفية 1: تشغيل لوحة التحكم
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # النافذة الطرفية 2: تشغيل خادم MCP
   npx -y @pimzino/spec-workflow-mcp@latest /path
   ```
2. تحقق من وجود دليل الموافقة:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. قم بتشغيل طلب الموافقة يدويًا من خلال الذكاء الاصطناعي

### لا يمكن الموافقة على المستندات

**الخطأ**: أزرار الموافقة لا تعمل

**الحلول**:
1. تحقق من وحدة تحكم المتصفح لأخطاء JavaScript
2. تحقق من أنك على صفحة المواصفة الصحيحة
3. تأكد من أن المستند لديه حالة موافقة معلقة
4. جرب استخدام إضافة VSCode بدلاً من ذلك (إذا كانت متاحة)

## مشكلات نظام الملفات

### ملفات المواصفات لا تُنشأ

**الخطأ**: مستندات المواصفات لا تظهر في نظام الملفات

**الحلول**:
1. تحقق من أذونات الكتابة:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. تحقق من دليل العمل الصحيح:
   ```bash
   pwd  # يجب أن يكون جذر مشروعك
   ```
3. ابحث عن الملفات المخفية:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. تحقق من عدم حظر مكافح الفيروسات لإنشاء الملفات

### رفض الإذن على الملفات

**الخطأ**: `EACCES` أو `Permission denied` عند إنشاء المواصفات

**الحلول**:
1. أصلح أذونات الدليل:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. تحقق من ملكية الملف:
   ```bash
   ls -la .spec-workflow
   # يجب أن يكون مملوكًا لمستخدمك
   ```
3. قم بالتشغيل من دليل تملكه (وليس أدلة النظام)

## مشكلات إضافة VSCode

### الإضافة لا تُحمّل

**الخطأ**: أيقونة Spec Workflow لا تظهر في شريط النشاط

**الحلول**:
1. تحقق من تثبيت الإضافة:
   - افتح الإضافات (Ctrl+Shift+X)
   - ابحث عن "Spec Workflow MCP"
   - تحقق من التثبيت والتمكين
2. أعد تحميل نافذة VSCode:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. تحقق من مخرجات الإضافة:
   - عرض → الإخراج → حدد "Spec Workflow" من القائمة المنسدلة
4. تأكد من أن المشروع لديه دليل `.spec-workflow`

### أوامر الإضافة لا تعمل

**الخطأ**: الأوامر تفشل أو تظهر أخطاء

**الحلول**:
1. افتح مجلد المشروع الذي يحتوي على `.spec-workflow`
2. تحقق من أن VSCode يستخدم مساحة العمل الصحيحة
3. عرض سجلات الإضافة للأخطاء المحددة
4. حاول إعادة تثبيت الإضافة:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## مشكلات التكوين

### ملف التكوين لا يُحمّل

**الخطأ**: الإعدادات في config.toml لا يتم تطبيقها

**الحلول**:
1. تحقق من صحة بناء جملة TOML:
   ```bash
   # ثبت مدقق TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. تحقق من موقع الملف:
   - الافتراضي: `.spec-workflow/config.toml`
   - مخصص: استخدم علامة `--config`
3. تأكد من عدم وجود أخطاء في بناء الجملة:
   ```toml
   # صحيح
   port = 3000
   lang = "en"

   # خاطئ
   port: 3000  # يجب استخدام = وليس :
   lang = en   # يجب أن يكون بين علامات اقتباس
   ```

### وسائط سطر الأوامر لا تعمل

**الخطأ**: العلامات مثل `--port` يتم تجاهلها

**الحلول**:
1. تحقق من ترتيب الوسائط:
   ```bash
   # صحيح
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # خاطئ
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. تأكد من أن قيم العلامة صالحة:
   - المنفذ: 1024-65535
   - اللغة: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. استخدم `--help` لرؤية جميع الخيارات

## مشكلات الأداء

### أوقات استجابة بطيئة

**الأعراض**: لوحة التحكم أو الأدوات تستجيب ببطء

**الحلول**:
1. تحقق من موارد النظام:
   ```bash
   # استخدام المعالج والذاكرة
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. قلل مراقبي الملفات في المشاريع الكبيرة:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. امسح سجلات الموافقة القديمة:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. استخدم أسماء مواصفات محددة بدلاً من سرد الجميع

### استخدام عالٍ للذاكرة

**الحلول**:
1. أعد تشغيل الخدمات دوريًا
2. حد من معدل تحديث لوحة التحكم:
   ```json
   // إعدادات VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. أرشف المواصفات المكتملة
4. امسح ذاكرة التخزين المؤقت للمتصفح للوحة التحكم

## مشكلات الشبكة

### خلف وكيل الشركة

**الحلول**:
1. قم بتكوين وكيل npm:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. استخدم التثبيت المحلي:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### جدار الحماية يحظر الاتصالات

**الحلول**:
1. السماح لـ Node.js من خلال جدار الحماية
2. استخدم localhost بدلاً من 0.0.0.0
3. قم بتكوين قواعد منافذ محددة
4. جرب نطاقات منافذ مختلفة

## مشكلات خاصة بالمنصة

### Windows

#### مشكلات تنسيق المسار
**الخطأ**: `Invalid path` أو لم يتم العثور على المسار

**الحلول**:
```bash
# استخدم الشرطة المائلة الأمامية
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# أو الشرطات المائلة العكسية المهربة
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### سياسة تنفيذ PowerShell
**الخطأ**: `cannot be loaded because running scripts is disabled`

**الحلول**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### حظر Gatekeeper
**الخطأ**: `cannot be opened because the developer cannot be verified`

**الحلول**:
1. تفضيلات النظام → الأمان والخصوصية → السماح
2. أو إزالة الحجر الصحي:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### التبعيات المفقودة
**الخطأ**: `shared library not found`

**الحلول**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## الحصول على المساعدة

### معلومات التشخيص

عند الإبلاغ عن المشكلات، قم بتضمين:

1. **معلومات النظام**:
   ```bash
   node --version
   npm --version
   uname -a  # أو 'ver' على Windows
   ```

2. **رسائل الخطأ**:
   - نص الخطأ الكامل
   - لقطة شاشة إذا كانت مشكلة مرئية
   - سجلات وحدة تحكم المتصفح

3. **التكوين**:
   - تكوين عميل MCP
   - محتويات config.toml
   - سطر الأوامر المستخدم

4. **خطوات إعادة الإنتاج**:
   - الأوامر الدقيقة المنفذة
   - السلوك المتوقع
   - السلوك الفعلي

### قنوات الدعم

1. **مشكلات GitHub**: [أنشئ مشكلة](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **التوثيق**: تحقق من الأدلة الأخرى في `/docs`
3. **المجتمع**: المناقشات والأسئلة والأجوبة

### وضع التصحيح

مكّن التسجيل المطوّل:

```bash
# عيّن متغير البيئة
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# قم بالتشغيل مع مخرجات التصحيح
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## نصائح الوقاية

### أفضل الممارسات

1. **استخدم دائمًا مسارات مطلقة** في التكوينات
2. **حافظ على تحديث Node.js** (v18+ مطلوب)
3. **قم بالتشغيل من دليل جذر المشروع**
4. **استخدم --help** للتحقق من الخيارات
5. **اختبر في بيئة نظيفة** عند حدوث مشكلات
6. **تحقق من السجلات** قبل افتراض الفشل
7. **احتفظ بنسخة احتياطية من دليل .spec-workflow** بانتظام

### الصيانة الدورية

1. امسح الموافقات القديمة شهريًا
2. أرشف المواصفات المكتملة
3. حدّث حزم npm بانتظام
4. راقب مساحة القرص للسجلات
5. أعد تشغيل الخدمات بعد التحديثات

## التوثيق ذو الصلة

- [دليل التكوين](CONFIGURATION.md) - خيارات التكوين المفصلة
- [دليل المستخدم](USER-GUIDE.md) - تعليمات الاستخدام العامة
- [دليل التطوير](DEVELOPMENT.md) - للمساهمة بالإصلاحات
- [دليل الواجهات](INTERFACES.md) - تفاصيل لوحة التحكم والإضافة

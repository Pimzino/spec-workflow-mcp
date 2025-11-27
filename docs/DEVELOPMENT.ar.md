# دليل التطوير

يغطي هذا الدليل إعداد بيئة التطوير، وبناء المشروع، والمساهمة في الكود، وفهم هندسة Spec Workflow MCP.

## المتطلبات الأساسية

### البرامج المطلوبة

- **Node.js** 18.0 أو أعلى
- **npm** 9.0 أو أعلى
- **Git** للتحكم في الإصدار
- معرفة **TypeScript** مفيدة

### الأدوات الموصى بها

- **VSCode** مع إضافات TypeScript
- **Chrome/Edge DevTools** لتصحيح أخطاء لوحة التحكم
- **Postman/Insomnia** لاختبار API

## إعداد بيئة التطوير

### 1. استنساخ المستودع

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. تثبيت التبعيات

```bash
npm install
```

هذا يثبت:
- MCP SDK
- TypeScript وأدوات البناء
- Express لخادم لوحة التحكم
- مكتبات WebSocket
- أطر الاختبار

### 3. بناء المشروع

```bash
npm run build
```

هذا يترجم ملفات TypeScript إلى JavaScript في دليل `dist/`.

## أوامر التطوير

### الأوامر الأساسية

| الأمر | الوصف |
|---------|-------------|
| `npm run dev` | البدء في وضع التطوير مع إعادة التحميل التلقائي |
| `npm run build` | بناء حزمة الإنتاج |
| `npm start` | تشغيل خادم الإنتاج |
| `npm test` | تشغيل مجموعة الاختبارات |
| `npm run clean` | إزالة القطع الأثرية للبناء |
| `npm run lint` | تشغيل مدقق الكود |
| `npm run format` | تنسيق الكود باستخدام Prettier |

### وضع التطوير

```bash
npm run dev
```

الميزات:
- إعادة التجميع التلقائي عند تغيير الملفات
- إعادة التحميل الساخن للوحة التحكم
- رسائل خطأ مفصلة
- خرائط المصدر للتصحيح

### البناء للإنتاج

```bash
npm run clean && npm run build
```

التحسينات:
- JavaScript مصغر
- حجم الحزمة محسّن
- معالجة أخطاء الإنتاج
- تحسينات الأداء

## هيكل المشروع

```
spec-workflow-mcp/
├── src/                    # الكود المصدري
│   ├── index.ts           # نقطة دخول خادم MCP
│   ├── server.ts          # خادم لوحة التحكم
│   ├── tools/             # تطبيقات أدوات MCP
│   ├── prompts/           # قوالب الأوامر
│   ├── utils/             # دوال الأدوات المساعدة
│   └── types/             # تعريفات أنواع TypeScript
├── dist/                   # JavaScript المترجم
├── dashboard/             # ملفات لوحة تحكم الويب
│   ├── index.html         # واجهة لوحة التحكم
│   ├── styles.css         # أنماط لوحة التحكم
│   └── script.js          # JavaScript لوحة التحكم
├── vscode-extension/      # إضافة VSCode
│   ├── src/               # مصدر الإضافة
│   └── package.json       # بيان الإضافة
├── tests/                 # ملفات الاختبار
├── docs/                  # التوثيق
└── package.json           # تكوين المشروع
```

## نظرة عامة على الهندسة

### هندسة خادم MCP

```
Client (AI) ↔ MCP Protocol ↔ Server ↔ File System
                              ↓
                          Dashboard
```

### المكونات الرئيسية

#### 1. خادم MCP (`src/index.ts`)
- يتعامل مع اتصالات بروتوكول MCP
- يعالج طلبات الأدوات
- يدير حالة المشروع
- عمليات نظام الملفات

#### 2. خادم لوحة التحكم (`src/server.ts`)
- يخدم لوحة تحكم الويب
- اتصالات WebSocket
- التحديثات الفورية
- نقاط نهاية HTTP API

#### 3. الأدوات (`src/tools/`)
كل أداة عبارة عن وحدة منفصلة:
- التحقق من صحة المدخلات
- منطق الأعمال
- عمليات الملفات
- تنسيق الاستجابة

#### 4. الأوامر (`src/prompts/`)
سلاسل القوالب لـ:
- توليد المستندات
- إرشادات سير العمل
- رسائل الخطأ
- تعليمات المستخدم

## تطبيق الميزات الجديدة

### إضافة أداة جديدة

1. **أنشئ ملف الأداة** في `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'وصف ما تفعله الأداة',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'وصف المعامل' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // تطبيق الأداة
    const { param1, param2 = 0 } = params;

    // منطق الأعمال هنا

    return {
      success: true,
      data: 'استجابة الأداة'
    };
  }
};
```

2. **سجل في الفهرس** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **أضف إلى الخادم** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### إضافة ميزات لوحة التحكم

1. **تحديث HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>ميزة جديدة</h3>
  <button id="new-action">إجراء</button>
</div>
```

2. **أضف JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // منطق الميزة
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **التعامل في الخادم** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // معالجة الإجراء الجديد
  }
});
```

## الاختبار

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل ملف اختبار محدد
npm test -- src/tools/my-tool.test.ts

# التشغيل مع التغطية
npm run test:coverage

# وضع المراقبة
npm run test:watch
```

### كتابة الاختبارات

أنشئ ملفات اختبار بجانب ملفات المصدر:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('يجب معالجة المدخلات بشكل صحيح', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('يجب معالجة الأخطاء', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### اختبار التكامل

اختبر سير العمل الكامل:

```typescript
// tests/integration/workflow.test.ts
describe('سير العمل الكامل', () => {
  it('يجب إنشاء المواصفة من البداية إلى النهاية', async () => {
    // إنشاء المتطلبات
    // الموافقة على المتطلبات
    // إنشاء التصميم
    // الموافقة على التصميم
    // إنشاء المهام
    // التحقق من الهيكل
  });
});
```

## التصحيح

### تصحيح خادم MCP

1. **أضف مخرجات التصحيح**:

```typescript
console.error('[DEBUG]', 'تم استدعاء الأداة:', toolName, params);
```

2. **استخدم مصحح VSCode**:

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

### تصحيح لوحة التحكم

1. **أدوات المطور للمتصفح**:
   - افتح لوحة التحكم في المتصفح
   - اضغط F12 لأدوات المطور
   - تحقق من وحدة التحكم للأخطاء
   - راقب علامة تبويب الشبكة لـ WebSocket

2. **أضف التسجيل**:

```javascript
console.log('رسالة WebSocket:', message);
console.log('تحديث الحالة:', newState);
```

## أسلوب الكود والمعايير

### إرشادات TypeScript

- استخدم الوضع الصارم
- حدد الواجهات لهياكل البيانات
- تجنب نوع `any`
- استخدم async/await بدلاً من callbacks

### تنظيم الملفات

- مكون واحد لكل ملف
- جمع الوظائف ذات الصلة
- اصطلاحات تسمية واضحة
- تعليقات شاملة

### اصطلاحات التسمية

- **الملفات**: kebab-case (`my-tool.ts`)
- **الفئات**: PascalCase (`SpecManager`)
- **الدوال**: camelCase (`createSpec`)
- **الثوابت**: UPPER_SNAKE (`MAX_RETRIES`)

## المساهمة

### عملية المساهمة

1. **افرع المستودع**
2. **أنشئ فرع الميزة**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **قم بإجراء التغييرات**
4. **اكتب الاختبارات**
5. **قم بتشغيل الاختبارات والمدقق**:
   ```bash
   npm test
   npm run lint
   ```
6. **أرسل التغييرات**:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **ادفع الفرع**:
   ```bash
   git push origin feature/my-feature
   ```
8. **أنشئ طلب سحب**

### تنسيق رسالة الالتزام

اتبع الالتزامات التقليدية:

- `feat:` ميزة جديدة
- `fix:` إصلاح خطأ
- `docs:` التوثيق
- `style:` التنسيق
- `refactor:` إعادة هيكلة الكود
- `test:` الاختبار
- `chore:` الصيانة

أمثلة:
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### إرشادات طلب السحب

- وصف واضح
- الإشارة إلى المشكلات ذات الصلة
- تضمين لقطات الشاشة لتغييرات واجهة المستخدم
- التأكد من نجاح جميع الاختبارات
- تحديث التوثيق

## النشر

### حزمة NPM

1. **تحديث الإصدار**:
   ```bash
   npm version patch|minor|major
   ```

2. **بناء الحزمة**:
   ```bash
   npm run build
   ```

3. **النشر**:
   ```bash
   npm publish
   ```

### إضافة VSCode

1. **تحديث إصدار الإضافة** في `vscode-extension/package.json`

2. **بناء الإضافة**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **النشر إلى السوق**:
   ```bash
   vsce publish
   ```

## تحسين الأداء

### أداء الخادم

- استخدم التخزين المؤقت لقراءات الملفات
- نفذ debouncing لمراقبي الملفات
- حسّن دفع رسائل WebSocket
- التحميل الكسول للمستندات الكبيرة

### أداء لوحة التحكم

- تقليل تحديثات DOM
- استخدم التمرير الافتراضي للقوائم الطويلة
- نفذ العرض التدريجي
- حسّن إعادة اتصال WebSocket

## اعتبارات الأمان

### التحقق من صحة المدخلات

تحقق دائمًا من صحة مدخلات الأداة:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Invalid spec name');
}

// تطهير مسارات الملفات
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Invalid path');
}
```

### أمان نظام الملفات

- قيد العمليات على دليل المشروع
- تحقق من صحة جميع مسارات الملفات
- استخدم عمليات ملفات آمنة
- نفذ فحوصات الأذونات

## استكشاف أخطاء التطوير وإصلاحها

### أخطاء البناء الشائعة

| الخطأ | الحل |
|-------|----------|
| أخطاء TypeScript | قم بتشغيل `npm run build` لرؤية أخطاء مفصلة |
| الوحدة غير موجودة | تحقق من الاستيرادات وقم بتشغيل `npm install` |
| المنفذ قيد الاستخدام بالفعل | غيّر المنفذ أو أنهِ العملية الموجودة |
| فشل اتصال WebSocket | تحقق من تشغيل الخادم وصحة المنفذ |

### نصائح التطوير

1. **استخدم وضع TypeScript الصارم** لسلامة أفضل للنوع
2. **مكّن خرائط المصدر** لتصحيح أسهل
3. **استخدم nodemon** لإعادة التشغيل التلقائي أثناء التطوير
4. **اختبر عمليات الملفات** في دليل معزول
5. **راقب الأداء** باستخدام Chrome DevTools

## الموارد

- [توثيق MCP SDK](https://github.com/anthropics/mcp-sdk)
- [دليل TypeScript](https://www.typescriptlang.org/docs/)
- [أفضل ممارسات Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode Extension API](https://code.visualstudio.com/api)

## التوثيق ذو الصلة

- [دليل التكوين](CONFIGURATION.md) - تكوين الخادم
- [دليل المستخدم](USER-GUIDE.md) - استخدام الخادم
- [مرجع الأدوات](TOOLS-REFERENCE.md) - توثيق الأدوات
- [استكشاف الأخطاء وإصلاحها](TROUBLESHOOTING.md) - المشكلات الشائعة

# مرجع الأدوات

وثائق كاملة لجميع أدوات MCP المقدمة من Spec Workflow MCP.

## نظرة عامة

يوفر Spec Workflow MCP أدوات متخصصة لتطوير البرمجيات المنظم. هذه الأدوات متاحة لمساعدي الذكاء الاصطناعي من خلال بروتوكول Model Context Protocol.

## فئات الأدوات

1. **أدلة سير العمل** - التوثيق والإرشاد
2. **إدارة المواصفات** - إنشاء وإدارة المواصفات
3. **أدوات السياق** - استرجاع معلومات المشروع
4. **أدوات التوجيه** - إرشادات على مستوى المشروع
5. **أدوات الموافقة** - سير عمل الموافقة على المستندات

## أدوات دليل سير العمل

### spec-workflow-guide

**الغرض**: يوفر إرشادات شاملة لعملية سير العمل المعتمد على المواصفات.

**المعاملات**: لا توجد

**القيم المرجعة**: دليل Markdown يشرح سير العمل الكامل

**مثال على الاستخدام**:
```
"Show me the spec workflow guide"
```

**يحتوي الرد على**:
- نظرة عامة على سير العمل
- العملية خطوة بخطوة
- أفضل الممارسات
- أمثلة على الأوامر

### steering-guide

**الغرض**: دليل لإنشاء مستندات توجيه المشروع.

**المعاملات**: لا توجد

**القيم المرجعة**: دليل Markdown لإنشاء مستندات التوجيه

**مثال على الاستخدام**:
```
"Show me how to create steering documents"
```

**يحتوي الرد على**:
- أنواع مستندات التوجيه
- عملية الإنشاء
- إرشادات المحتوى
- أمثلة

## أدوات إدارة المواصفات

### create-spec-doc

**الغرض**: إنشاء أو تحديث مستندات المواصفات (المتطلبات، التصميم، المهام).

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة (kebab-case) |
| docType | string | نعم | النوع: "requirements" أو "design" أو "tasks" |
| content | string | نعم | محتوى Markdown للمستند |
| revision | boolean | لا | ما إذا كانت هذه مراجعة (افتراضي: false) |

**مثال على الاستخدام**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# User Authentication Requirements\n\n## Overview\n...",
  revision: false
}
```

**القيم المرجعة**:
```typescript
{
  success: true,
  message: "Requirements document created successfully",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**ملاحظات**:
- ينشئ دليل المواصفة إذا لم يكن موجودًا
- يطلب الموافقة تلقائيًا للمستندات الجديدة
- يتحقق من صيغة Markdown
- يحافظ على المستندات الموجودة عند إنشاء أنواع جديدة

### spec-list

**الغرض**: يسرد جميع المواصفات مع حالتها الحالية.

**المعاملات**: لا توجد

**القيم المرجعة**: مصفوفة من ملخصات المواصفات

**بنية الاستجابة**:
```typescript
[
  {
    name: "user-authentication",
    status: "in-progress",
    progress: 45,
    documents: {
      requirements: "approved",
      design: "pending-approval",
      tasks: "not-created"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**مثال على الاستخدام**:
```
"List all my specs"
```

### spec-status

**الغرض**: يحصل على معلومات حالة مفصلة لمواصفة محددة.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة للتحقق منها |

**القيم المرجعة**: حالة المواصفة المفصلة

**بنية الاستجابة**:
```typescript
{
  exists: true,
  name: "user-authentication",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementation"
}
```

**مثال على الاستخدام**:
```
"Show me the status of user-authentication spec"
```

### manage-tasks

**الغرض**: إدارة شاملة للمهام بما في ذلك التحديثات وتغييرات الحالة وتتبع التقدم.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة |
| action | string | نعم | الإجراء: "update" أو "complete" أو "list" أو "progress" |
| taskId | string | أحيانًا | معرف المهمة (مطلوب لـ update/complete) |
| status | string | لا | الحالة الجديدة: "pending" أو "in-progress" أو "completed" |
| notes | string | لا | ملاحظات إضافية للمهمة |

**الإجراءات**:

1. **تحديث حالة المهمة**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Started implementation"
}
```

2. **إكمال المهمة**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **سرد المهام**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **الحصول على التقدم**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**القيم المرجعة**: معلومات المهمة أو تأكيد التحديث

## أدوات السياق

### get-template-context

**الغرض**: يسترجع قوالب Markdown لجميع أنواع المستندات.

**المعاملات**: لا توجد

**القيم المرجعة**: كائن يحتوي على جميع القوالب

**بنية الاستجابة**:
```typescript
{
  requirements: "# Requirements Template\n\n## Overview\n...",
  design: "# Design Template\n\n## Architecture\n...",
  tasks: "# Tasks Template\n\n## Implementation Tasks\n...",
  product: "# Product Steering Template\n...",
  tech: "# Technical Steering Template\n...",
  structure: "# Structure Steering Template\n..."
}
```

**مثال على الاستخدام**:
```
"Get all document templates"
```

### get-steering-context

**الغرض**: يسترجع مستندات توجيه المشروع والإرشادات.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| docType | string | لا | مستند محدد: "product" أو "tech" أو "structure" أو "all" |

**القيم المرجعة**: محتوى مستند التوجيه

**مثال على الاستخدام**:
```typescript
{
  docType: "tech"  // Returns only technical steering
}
```

**بنية الاستجابة**:
```typescript
{
  product: "# Product Steering\n\n## Vision\n...",
  tech: "# Technical Steering\n\n## Architecture\n...",
  structure: "# Structure Steering\n\n## Organization\n..."
}
```

### get-spec-context

**الغرض**: يسترجع السياق الكامل لمواصفة محددة.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة |
| includeContent | boolean | لا | تضمين محتوى المستند (افتراضي: true) |

**القيم المرجعة**: سياق المواصفة الكامل

**بنية الاستجابة**:
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Requirements\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Design\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Tasks\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["user-profile", "session-management"],
  dependencies: ["database-setup", "auth-library"]
}
```

**مثال على الاستخدام**:
```
"Get full context for user-authentication spec"
```

## أدوات مستند التوجيه

### create-steering-doc

**الغرض**: إنشاء مستندات توجيه المشروع (المنتج، التقنية، الهيكل).

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| docType | string | نعم | النوع: "product" أو "tech" أو "structure" |
| content | string | نعم | محتوى Markdown للمستند |

**مثال على الاستخدام**:
```typescript
{
  docType: "product",
  content: "# Product Steering\n\n## Vision\nBuild the best..."
}
```

**القيم المرجعة**:
```typescript
{
  success: true,
  message: "Product steering document created",
  path: ".spec-workflow/steering/product.md"
}
```

**ملاحظات**:
- ينشئ دليل التوجيه إذا لزم الأمر
- يستبدل مستندات التوجيه الموجودة
- لا حاجة للموافقة على مستندات التوجيه
- يجب إنشاؤها قبل المواصفات

## أدوات نظام الموافقة

### request-approval

**الغرض**: يطلب موافقة المستخدم على مستند.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة |
| docType | string | نعم | نوع المستند للموافقة عليه |
| documentId | string | نعم | معرف فريد للتتبع |
| content | string | نعم | محتوى المستند للمراجعة |

**مثال على الاستخدام**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requirements\n\n..."
}
```

**القيم المرجعة**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approval requested. Check dashboard to review."
}
```

### get-approval-status

**الغرض**: يتحقق من حالة موافقة المستند.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة |
| documentId | string | نعم | معرف المستند للتحقق منه |

**القيم المرجعة**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Please add more detail about error handling",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**مثال على الاستخدام**:
```
"Check approval status for user-auth requirements"
```

### delete-approval

**الغرض**: يزيل طلبات الموافقة المكتملة لتنظيف قائمة الموافقة.

**المعاملات**:

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| specName | string | نعم | اسم المواصفة |
| documentId | string | نعم | معرف المستند للإزالة |

**القيم المرجعة**:
```typescript
{
  success: true,
  message: "Approval record deleted"
}
```

**مثال على الاستخدام**:
```
"Clean up completed approvals for user-auth"
```

## أنماط تكامل الأدوات

### سير العمل المتسلسل

الأدوات مصممة للعمل بشكل متسلسل:

1. `steering-guide` → تعلم عن التوجيه
2. `create-steering-doc` → إنشاء مستندات التوجيه
3. `spec-workflow-guide` → تعلم سير العمل
4. `create-spec-doc` → إنشاء المتطلبات
5. `request-approval` → طلب المراجعة
6. `get-approval-status` → التحقق من الحالة
7. `create-spec-doc` → إنشاء التصميم (بعد الموافقة)
8. `manage-tasks` → تتبع التنفيذ

### العمليات المتزامنة

يمكن استخدام بعض الأدوات في وقت واحد:

- `spec-list` + `spec-status` → الحصول على نظرة عامة وتفاصيل
- `get-spec-context` + `get-steering-context` → سياق المشروع الكامل
- `create-spec-doc` متعددة → إنشاء مواصفات متعددة

### معالجة الأخطاء

جميع الأدوات تعيد بنى أخطاء متسقة:

```typescript
{
  success: false,
  error: "Spec not found",
  details: "No spec named 'invalid-spec' exists",
  suggestion: "Use spec-list to see available specs"
}
```

## أفضل الممارسات

### اختيار الأداة

1. **جمع المعلومات**:
   - استخدم `spec-list` للحصول على نظرة عامة
   - استخدم `spec-status` لمواصفة محددة
   - استخدم `get-spec-context` للتنفيذ

2. **إنشاء المستندات**:
   - أنشئ المتطلبات دائمًا أولاً
   - انتظر الموافقة قبل التصميم
   - أنشئ المهام بعد الموافقة على التصميم

3. **إدارة المهام**:
   - حدّث الحالة عند بدء المهام
   - ضع علامة مكتمل فورًا بعد الانتهاء
   - استخدم الملاحظات للسياق المهم

### اعتبارات الأداء

- **العمليات المجمعة**: اطلب مواصفات متعددة في محادثة واحدة
- **التخزين المؤقت**: الأدوات تخزن قراءات الملفات مؤقتًا للأداء
- **التحميل الانتقائي**: استخدم `includeContent: false` لفحوصات حالة أسرع

### الأمان

- **التحقق من المسار**: جميع المسارات يتم التحقق منها وتنظيفها
- **عزل المشروع**: الأدوات تصل فقط إلى دليل المشروع
- **تنظيف الإدخال**: محتوى Markdown يتم تنظيفه
- **عدم التنفيذ**: الأدوات لا تنفذ الكود أبدًا

## توسيع الأدوات

### تطوير أداة مخصصة

لإضافة أدوات جديدة:

1. إنشاء وحدة أداة في `src/tools/`
2. تعريف مخطط المعاملات
3. تنفيذ دالة المعالج
4. التسجيل مع خادم MCP
5. الإضافة إلى الصادرات

مثال على البنية:
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Description',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implementation
  }
};
```

## إصدارات الأدوات

الأدوات تحافظ على التوافق العكسي:

- إضافات المعاملات اختيارية
- بنى الاستجابة تمتد، لا تستبدل
- الميزات المهجورة تظهر تحذيرات
- أدلة الهجرة متوفرة

## الوثائق ذات الصلة

- [دليل المستخدم](USER-GUIDE.md) - استخدام الأدوات بفعالية
- [عملية سير العمل](WORKFLOW.md) - استخدام الأدوات في سير العمل
- [دليل الأوامر](PROMPTING-GUIDE.md) - أمثلة استخدام الأدوات
- [دليل التطوير](DEVELOPMENT.md) - إضافة أدوات جديدة

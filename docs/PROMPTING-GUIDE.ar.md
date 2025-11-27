# دليل الأوامر

دليل شامل مع أمثلة وأفضل الممارسات للتفاعل مع Spec Workflow MCP من خلال مساعدي الذكاء الاصطناعي.

## مرجع سريع

### الأوامر الأساسية

```
"Create a spec for [feature]"
"List all my specs"
"Show status of [spec-name]"
"Implement task [number] from [spec]"
"Create steering documents"
```

## إنشاء المواصفات

### إنشاء مواصفة أساسية

#### طلب بسيط
```
"Create a spec for user authentication"
```

سينشئ الذكاء الاصطناعي:
- مستند المتطلبات
- مستند التصميم (بعد الموافقة)
- تفصيل المهام (بعد الموافقة على التصميم)

#### طلب مفصل
```
"Create a spec called payment-processing with:
- Credit card payments via Stripe
- PayPal integration
- Refund handling
- Webhook processing for payment events
- PCI compliance considerations"
```

#### من وثائق موجودة
```
"Create a spec from the PRD in @product-requirements.md"
```

```
"Build a spec based on the design document at @figma-export.md"
```

### إنشاء مواصفة متقدمة

#### مع قيود تقنية
```
"Create a spec for real-time notifications that:
- Uses WebSockets for live updates
- Falls back to polling for older browsers
- Handles up to 10,000 concurrent connections
- Maintains message ordering
- Includes offline queue support"
```

#### مع معايير القبول
```
"Create a spec for search functionality with these acceptance criteria:
- Results appear within 200ms
- Supports fuzzy matching
- Includes filters for date, category, and author
- Shows relevance scoring
- Handles typos and synonyms"
```

#### مواصفة خدمة مصغرة
```
"Create a spec for an inventory microservice that:
- Exposes REST API
- Uses PostgreSQL for storage
- Publishes events to Kafka
- Implements CQRS pattern
- Includes health check endpoints"
```

## إدارة المواصفات

### السرد والحالة

#### الحصول على نظرة عامة
```
"List all my specs"
"Show me all specs and their progress"
"Which specs are waiting for approval?"
"What specs are currently in progress?"
```

#### حالة محددة
```
"Show the status of the user-auth spec"
"What's the progress on payment-processing?"
"Show me what's left to do in the notification spec"
"Which tasks are completed in user-profile?"
```

#### التصفية
```
"Show me specs that are over 50% complete"
"List specs waiting for my approval"
"Which specs have no tasks completed yet?"
"Show blocked or stuck specs"
```

### إدارة المستندات

#### عرض المستندات
```
"Show me the requirements for user-auth"
"Display the design document for payments"
"What are the tasks for the notification system?"
"Show all documents for the search spec"
```

#### تحديث المستندات
```
"Update the user-auth requirements to include 2FA"
"Revise the payment design to use Stripe Connect"
"Add a task for security testing to user-profile"
"Update requirements based on the feedback: [feedback]"
```

## أوامر التنفيذ

### المهام الفردية

#### التنفيذ الأساسي
```
"Implement task 1.2 from user-auth"
"Complete task 2.1.3 in the payment spec"
"Work on the next pending task in notifications"
```

#### مع السياق
```
"Implement task 1.2 from user-auth using TypeScript and Express"
"Complete the database migration task using Prisma"
"Implement the API endpoint task following REST conventions"
```

### التنفيذ الجماعي

#### حسب القسم
```
"Implement all database tasks from user-auth"
"Complete all frontend tasks in the dashboard spec"
"Work through all API tasks for payments"
```

#### حسب الأولوية
```
"Implement all critical tasks first"
"Complete the MVP tasks from user-profile"
"Focus on tasks needed for the demo"
```

#### متسلسل
```
"Implement tasks 1.1 through 1.5 from user-auth"
"Complete all subtasks under section 2"
"Work through the setup tasks in order"
```

### استراتيجيات التنفيذ

#### مدفوع بالاختبار
```
"For task 1.2, write tests first then implement"
"Implement task 2.1 with full test coverage"
"Create unit tests while implementing the service task"
```

#### مع التوثيق
```
"Implement task 1.3 and document the API"
"Complete the authentication task with inline comments"
"Implement and create usage examples for task 2.2"
```

## مستندات التوجيه

### إنشاء التوجيه

#### مجموعة كاملة
```
"Create steering documents for my e-commerce project"
"Set up steering for a SaaS application"
"Create project guidance for a mobile app"
```

#### مستندات فردية
```
"Create a product steering document focusing on user experience"
"Create technical steering for a microservices architecture"
"Create structure steering for a monorepo setup"
```

#### من السياق
```
"Create steering documents based on @project-brief.md"
"Generate steering from our technical decisions in @architecture.md"
```

### تحديث التوجيه

```
"Update product steering to include B2B features"
"Revise technical steering to use GraphQL instead of REST"
"Update structure steering for the new module system"
```

## سير عمل الموافقة

### طلب الملاحظات

#### مع مخاوف محددة
```
"Request approval for user-auth requirements - particularly check the security section"
"Ask for review of the payment design - focus on the error handling"
"Request feedback on the task breakdown - is it too granular?"
```

#### طلبات المراجعة
```
"The requirements need more detail on:
- Error handling scenarios
- Performance requirements
- Security considerations
Please revise and resubmit"
```

### قرارات الموافقة

#### الموافقة
```
"Approve the user-auth requirements"
"The design looks good, approve it"
"Accept the task breakdown as is"
```

#### طلب التغييرات
```
"Request changes to the requirements:
- Add multi-tenant support
- Include rate limiting
- Specify data retention policy"
```

#### الرفض
```
"Reject the current design - we need to use event-driven architecture instead"
"Start over with the requirements - the scope is too broad"
```

## سير عمل الأخطاء

### الإبلاغ عن الأخطاء

#### تقرير مفصل
```
"Create a bug report:
Title: Login fails with special characters
Steps: 1) Enter email with '+' 2) Submit form 3) See error
Expected: Login succeeds
Actual: 500 error
Priority: High
Environment: Production"
```

#### من سجلات الأخطاء
```
"Create a bug report from this error: [paste stack trace]"
"Document this bug from the Sentry alert: [link]"
```

### حل الأخطاء

#### التحقيق
```
"Investigate the root cause of bug #45"
"Analyze why the payment webhook is failing"
"Debug the performance issue in the search endpoint"
```

#### تنفيذ الإصلاح
```
"Create a fix for bug #45 in user authentication"
"Implement a solution for the payment timeout issue"
"Fix the memory leak in the notification service"
```

## التغييرات في منتصف التنفيذ

### عندما تتغير المواصفات أثناء التطوير

غالبًا ما تتطور المتطلبات والتصاميم أثناء التنفيذ. عندما يحدث هذا، تحتاج إلى إبقاء tasks.md متوافقًا مع المواصفة الحالية مع الحفاظ على العمل المكتمل.

### استخدام ميزة تحديث المهام

الذكاء الاصطناعي لديه وصول إلى تعليمات تحديث المهام الشاملة من خلال أمر refresh-tasks. ببساطة أبلغ الذكاء الاصطناعي عن تغييراتك:

#### تحديث المهام الأساسي
```
"The requirements have been updated. Please refresh tasks.md to align with the current requirements.md and design.md."
```

#### تحديث المهام المفصل مع السياق
```
"I've updated the spec with the following changes:
- Removed the reporting module
- Changed database from MongoDB to PostgreSQL
- Added social login feature

Please refresh tasks.md following the task refresh process:
1. Preserve all completed and in-progress tasks
2. Add migration tasks for the database change
3. Remove pending tasks for the reporting module
4. Add new tasks for social login"
```

#### تغيير البنية يتطلب الترحيل
```
"We're switching from REST API to GraphQL. Several REST endpoints are already implemented. Please update tasks.md with:
1. All completed REST work preserved
2. Migration tasks to wrap REST logic in GraphQL resolvers
3. New GraphQL implementation tasks
4. Cleanup tasks to remove REST after GraphQL is verified"
```

### السلوك المتوقع للذكاء الاصطناعي

عندما تطلب تحديث المهام، سيقوم الذكاء الاصطناعي بـ:

1. **تحليل الحالة الحالية**
   - قراءة requirements.md و design.md للمواصفة الحالية
   - تحديد المهام المكتملة وقيد التنفيذ والمعلقة
   - تحديد الميزات التي تمت إضافتها أو إزالتها أو تغييرها

2. **الحفاظ على العمل المكتمل**
   - الاحتفاظ بجميع المهام المكتملة [x] دون تغيير
   - الاحتفاظ بجميع المهام قيد التنفيذ [-] دون تغيير
   - إضافة ملاحظات عندما يكون العمل المكتمل لميزات تمت إزالتها

3. **معالجة تغييرات البنية**
   - إضافة مهام الترحيل بعد العمل المكتمل الذي يحتاج إلى تحديث
   - إنشاء مهام انتقالية للترحيل التدريجي
   - تضمين مهام التحقق قبل إزالة التنفيذ القديم

4. **تحديث المهام المعلقة**
   - إزالة المهام المعلقة للميزات المحذوفة
   - تحديث المهام المعلقة للمتطلبات المتغيرة
   - إضافة مهام جديدة للميزات الجديدة

5. **الحفاظ على بنية المهام**
   - الحفاظ على الترقيم المتسلسل
   - الحفاظ على صيغة المهام
   - تضمين مراجع المتطلبات
   - الحفاظ على ترتيب التبعيات

### أمثلة على السيناريوهات

#### إزالة ميزة
```
"We've decided to remove the reporting module from the spec. Update tasks.md accordingly."
```

السلوك المتوقع للذكاء الاصطناعي:
- الاحتفاظ بجميع مهام التقارير المكتملة بحالة [x]
- الاحتفاظ بجميع مهام التقارير قيد التنفيذ بحالة [-]
- إزالة مهام التقارير المعلقة [ ] فقط
- إضافة ملاحظة: "_ملاحظة: تمت إزالة ميزة التقارير من المواصفة ولكن تم الحفاظ على العمل المكتمل_"

#### تغيير البنية مع العمل المكتمل
```
"We're switching from MongoDB to PostgreSQL. Update the pending database tasks. Note that we've already implemented MongoDB schemas and connection logic."
```

السلوك المتوقع للذكاء الاصطناعي:
- الحفاظ على جميع مهام MongoDB المكتملة تمامًا كما هي مكتوبة
- الحفاظ على جميع مهام MongoDB قيد التنفيذ تمامًا كما هي مكتوبة
- إضافة مهام ترحيل جديدة مباشرة بعد عمل MongoDB المكتمل:
  - ترحيل مخططات MongoDB إلى جداول PostgreSQL
  - استبدال منطق اتصال MongoDB بعميل PostgreSQL
  - تحديث استعلامات قاعدة البيانات من بناء جملة MongoDB إلى PostgreSQL
  - ترحيل بيانات MongoDB الموجودة إلى PostgreSQL
  - تحديث تكوين البيئة لـ PostgreSQL
  - إزالة تبعيات MongoDB بعد التحقق من الترحيل
- تحديث مهام قاعدة البيانات المعلقة المتبقية لاستخدام PostgreSQL
- الحفاظ على تسلسل ترقيم المهام

#### إضافة ميزة
```
"Add social login to the authentication spec. The requirements and design have been updated."
```

السلوك المتوقع للذكاء الاصطناعي:
- تحليل بنية المهام الحالية لنقطة الإدراج المنطقية
- إضافة مهام تسجيل الدخول الاجتماعي الجديدة بترقيم مناسب
- الإشارة إلى المتطلبات المحددة لتسجيل الدخول الاجتماعي
- التأكد من أن المهام الجديدة تحافظ على ترتيب التبعيات
- إذا كانت المصادقة الأساسية قد تم تنفيذها بالفعل، إضافة مهام التكامل

### معالجة ترحيلات البنية

عندما تؤثر تغييرات البنية على الكود المنفذ بالفعل:

#### ترحيل REST إلى GraphQL
```
"We're changing from REST to GraphQL. Several REST endpoints are already implemented."
```

إضافات المهام المتوقعة:
- الحفاظ على مهام نقاط نهاية REST المكتملة
- إضافة مهام تعريف مخطط GraphQL
- إضافة مهام تنفيذ المحلل
- إضافة مهام الترحيل لتغليف منطق REST في محللات GraphQL
- إضافة مهام لتحديث كود العميل لاستخدام GraphQL
- إضافة مهام التنظيف لإزالة نقاط نهاية REST بعد التحقق من GraphQL

#### تقسيم Monolith إلى Microservices
```
"We're splitting the monolithic user service into separate auth and profile services."
```

إضافات المهام المتوقعة:
- الحفاظ على مهام الخدمة الأحادية المكتملة
- إضافة مهام فصل الخدمة
- إضافة مهام الاتصال بين الخدمات
- إضافة مهام ترحيل البيانات إذا كانت قواعد البيانات تنقسم
- إضافة مهام تكوين النشر للخدمات الجديدة
- إضافة مهام التنظيف لإزالة الكود الأحادي بعد التحقق من الخدمات

### صيغة المهام للترحيلات

يجب أن تشير مهام الترحيل بوضوح إلى غرضها:

```
"After refreshing tasks, I see you've added:
- [ ] 2.4 Migrate MongoDB schemas to PostgreSQL tables
  - File: src/database/migrations/mongo-to-postgres.ts
  - Convert document schemas to relational tables
  - Map embedded documents to foreign key relationships
  - Preserve all existing data relationships
  - Purpose: Transition database layer to new architecture
  - _Leverage: Completed MongoDB schemas in tasks 2.1-2.3_
  - _Requirements: Design section 3.2_"
```

### التواصل مع الذكاء الاصطناعي حول التغييرات

عند إبلاغ الذكاء الاصطناعي عن تغييرات المواصفة:

#### كن محددًا حول التغييرات والتأثير
```
"The payment processing requirements have changed. Stripe is now required instead of PayPal. We've already implemented PayPal webhook handlers. Please update tasks.md to reflect this change, including migration tasks."
```

#### وفر السياق للحفظ والترحيل
```
"Although we're moving from MongoDB to PostgreSQL, keep all completed MongoDB tasks since that work is already done. Add migration tasks to transition the implemented MongoDB code to PostgreSQL."
```

#### اطلب التحقق
```
"After updating tasks.md, confirm that all requirements in requirements.md have corresponding tasks, migration paths exist for architecture changes, and that no pending tasks exist for removed features."
```

### استراتيجية الترحيل التدريجي

بالنسبة لتغييرات البنية الرئيسية، يجب أن ينشئ الذكاء الاصطناعي مهام تدعم الترحيل التدريجي:

1. تنفيذ البنية الجديدة جنبًا إلى جنب مع الموجودة
2. إضافة مهام طبقة التوافق
3. ترحيل الوظائف تدريجيًا
4. التحقق من كل خطوة ترحيل
5. إزالة التنفيذ القديم فقط بعد التحقق الكامل

هذا يضمن بقاء التطبيق وظيفيًا طوال الانتقال.

### استخدام أمر Refresh Tasks

يمكنك أيضًا استدعاء أمر تحديث المهام بشكل صريح:

```
"Use the refresh-tasks prompt for the user-auth spec. The changes are: switched from JWT to OAuth2 for authentication."
```

سيتبع الذكاء الاصطناعي بعد ذلك تعليمات التحديث الشاملة لتحديث مهامك مع الحفاظ على جميع الأعمال المكتملة.

## الأنماط المتقدمة

### سير عمل متعدد المواصفات

#### مواصفات مرتبطة
```
"Create a spec for admin-dashboard that integrates with:
- user-management spec
- analytics spec
- reporting spec"
```

#### تبعيات المواصفات
```
"Create a spec for notifications that depends on:
- user-auth being complete
- message-queue being implemented
- email-service being available"
```

### التطوير التدريجي

#### MVP أولاً
```
"Create an MVP spec for user-profiles with just:
- Basic profile creation
- Display name and avatar
- Public profile view
(We'll add social features later)"
```

#### مواصفات التحسين
```
"Create an enhancement spec for user-auth adding:
- Social login (Google, GitHub)
- Biometric authentication
- Enhanced session management
- Account linking"
```

### سيناريوهات معقدة

#### مواصفات الترحيل
```
"Create a spec for migrating from MongoDB to PostgreSQL:
- Document current schema
- Design new relational structure
- Plan zero-downtime migration
- Include rollback procedures"
```

#### مواصفات إعادة الهيكلة
```
"Create a refactoring spec to:
- Split the monolith into services
- Extract shared components
- Improve test coverage to 80%
- Maintain backward compatibility"
```

#### مواصفات الأداء
```
"Create a performance optimization spec:
- Profile current bottlenecks
- Design caching strategy
- Plan database indexing
- Implement monitoring"
```

## تركيبات سير العمل

### تدفق ميزة كامل
```
1. "Create steering documents for the project"
2. "Create a spec for user authentication"
3. "Review and approve requirements"
4. "Review and approve design"
5. "Implement task 1.1 - database schema"
6. "Implement task 1.2 - authentication service"
7. "Create tests for the authentication flow"
8. "Mark all tasks as complete"
```

### التطوير المتوازي
```
"While I review the requirements, start drafting the API design"
"Create specs for both frontend and backend in parallel"
"Work on UI tasks while the backend team does API tasks"
```

### التحسين التكراري
```
1. "Create initial spec for search"
2. "Implement basic search (tasks 1-3)"
3. "Create enhancement spec for advanced search"
4. "Add filtering and sorting features"
5. "Create optimization spec for search performance"
```

## أوامر واعية بالسياق

### استخدام سياق المشروع
```
"Create a spec that follows our existing patterns"
"Implement this task consistent with our codebase"
"Design this feature to integrate with our current architecture"
```

### الإشارة إلى مواصفات أخرى
```
"Create a spec similar to user-auth but for admin authentication"
"Use the same design patterns as in the payment spec"
"Follow the task structure from our notification spec"
```

### البناء على العمل السابق
```
"Extend the user-auth spec to include team management"
"Add GraphQL support to the existing REST API spec"
"Enhance the search spec with machine learning features"
```

## نصائح للأوامر الفعالة

### كن محددًا
❌ **غامض**: "Create a login spec"
✅ **محدد**: "Create a spec for email/password login with 2FA, remember me, and password reset"

### وفر السياق
❌ **بدون سياق**: "Implement the task"
✅ **مع السياق**: "Implement task 1.2 using our existing Express middleware and PostgreSQL database"

### ضع توقعات واضحة
❌ **غير واضح**: "Make it better"
✅ **واضح**: "Improve the design to handle 10x current traffic with response times under 200ms"

### استخدم الطلبات التدريجية
❌ **كثير جدًا**: "Create 5 specs and implement everything"
✅ **تدريجي**: "Create the user-auth spec first, then we'll review before moving to the next"

### الإشارة إلى العمل الموجود
❌ **البدء من جديد**: "Create a new payment system"
✅ **البناء على**: "Enhance our payment spec to add subscription billing"

## مكتبة الأنماط الشائعة

### عمليات CRUD
```
"Create a spec for CRUD operations on products including:
- Create with validation
- Read with pagination and filtering
- Update with optimistic locking
- Soft delete with recovery option"
```

### المصادقة والتفويض
```
"Create an auth spec with:
- JWT-based authentication
- Role-based access control
- API key management
- Session handling
- Refresh token rotation"
```

### ميزات الوقت الفعلي
```
"Create a spec for real-time chat:
- WebSocket connections
- Message persistence
- Typing indicators
- Read receipts
- Offline message queue"
```

### إدارة الملفات
```
"Create a file upload spec:
- Chunked uploads for large files
- Progress tracking
- Resume capability
- Virus scanning
- CDN integration"
```

### التحليلات والتقارير
```
"Create an analytics spec:
- Event tracking
- Custom dimensions
- Real-time dashboards
- Scheduled reports
- Data export options"
```

## أوامر استكشاف الأخطاء وإصلاحها

### عندما تسوء الأمور
```
"Why is this spec not showing up?"
"Debug why the task isn't completing"
"What's blocking the approval?"
"Help me understand this error"
```

### الخروج من المأزق
```
"What should I do next?"
"Show me what's blocking progress"
"What tasks can I work on while waiting?"
"How do I resolve this dependency?"
```

## الوثائق ذات الصلة

- [دليل المستخدم](USER-GUIDE.md) - تعليمات الاستخدام العامة
- [عملية سير العمل](WORKFLOW.md) - فهم سير العمل
- [مرجع الأدوات](TOOLS-REFERENCE.md) - وثائق الأدوات الكاملة
- [استكشاف الأخطاء وإصلاحها](TROUBLESHOOTING.md) - حل المشاكل الشائعة

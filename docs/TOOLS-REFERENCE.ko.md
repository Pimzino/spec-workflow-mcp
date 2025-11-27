# 도구 참조

Spec Workflow MCP에서 제공하는 모든 MCP 도구에 대한 완전한 문서입니다.

## 개요

Spec Workflow MCP는 구조화된 소프트웨어 개발을 위한 전문 도구를 제공합니다. 이러한 도구는 Model Context Protocol을 통해 AI 어시스턴트에서 접근할 수 있습니다.

## 도구 카테고리

1. **워크플로우 가이드** - 문서 및 안내
2. **Spec 관리** - 사양 생성 및 관리
3. **컨텍스트 도구** - 프로젝트 정보 검색
4. **Steering 도구** - 프로젝트 수준 가이드
5. **승인 도구** - 문서 승인 워크플로우

## 워크플로우 가이드 도구

### spec-workflow-guide

**목적**: spec 중심 워크플로우 프로세스에 대한 포괄적인 가이드를 제공합니다.

**매개변수**: 없음

**반환값**: 완전한 워크플로우를 설명하는 Markdown 가이드

**사용 예제**:
```
"spec 워크플로우 가이드 보여줘"
```

**응답 포함 내용**:
- 워크플로우 개요
- 단계별 프로세스
- 모범 사례
- 예제 프롬프트

### steering-guide

**목적**: 프로젝트 steering 문서 생성 가이드입니다.

**매개변수**: 없음

**반환값**: steering 문서 생성을 위한 Markdown 가이드

**사용 예제**:
```
"steering 문서 만드는 방법 보여줘"
```

**응답 포함 내용**:
- Steering 문서 유형
- 생성 프로세스
- 내용 가이드라인
- 예제

## Spec 관리 도구

### create-spec-doc

**목적**: 사양 문서(요구사항, 설계, 작업)를 생성하거나 업데이트합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 (kebab-case) |
| docType | string | 예 | 타입: "requirements", "design", 또는 "tasks" |
| content | string | 예 | 문서의 Markdown 내용 |
| revision | boolean | 아니오 | 수정 여부 (기본값: false) |

**사용 예제**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# User Authentication Requirements\n\n## Overview\n...",
  revision: false
}
```

**반환값**:
```typescript
{
  success: true,
  message: "Requirements document created successfully",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**참고사항**:
- spec 디렉토리가 없으면 생성
- 새 문서에 대해 자동으로 승인 요청
- Markdown 형식 검증
- 새 타입 생성 시 기존 문서 보존

### spec-list

**목적**: 모든 사양을 현재 상태와 함께 나열합니다.

**매개변수**: 없음

**반환값**: spec 요약 배열

**응답 구조**:
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

**사용 예제**:
```
"내 모든 spec 목록 보여줘"
```

### spec-status

**목적**: 특정 spec에 대한 상세 상태 정보를 가져옵니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | 확인할 spec의 이름 |

**반환값**: 상세 spec 상태

**응답 구조**:
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

**사용 예제**:
```
"user-authentication spec의 상태 보여줘"
```

### manage-tasks

**목적**: 업데이트, 상태 변경, 진행 상황 추적을 포함한 포괄적인 작업 관리입니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 |
| action | string | 예 | 작업: "update", "complete", "list", "progress" |
| taskId | string | 때때로 | 작업 ID (update/complete에 필요) |
| status | string | 아니오 | 새 상태: "pending", "in-progress", "completed" |
| notes | string | 아니오 | 작업에 대한 추가 메모 |

**작업**:

1. **작업 상태 업데이트**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Started implementation"
}
```

2. **작업 완료**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **작업 목록**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **진행 상황 가져오기**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**반환값**: 작업 정보 또는 업데이트 확인

## 컨텍스트 도구

### get-template-context

**목적**: 모든 문서 타입에 대한 Markdown 템플릿을 검색합니다.

**매개변수**: 없음

**반환값**: 모든 템플릿을 포함하는 객체

**응답 구조**:
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

**사용 예제**:
```
"모든 문서 템플릿 가져와줘"
```

### get-steering-context

**목적**: 프로젝트 steering 문서 및 가이드를 검색합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| docType | string | 아니오 | 특정 문서: "product", "tech", "structure", 또는 "all" |

**반환값**: Steering 문서 내용

**사용 예제**:
```typescript
{
  docType: "tech"  // 기술 steering만 반환
}
```

**응답 구조**:
```typescript
{
  product: "# Product Steering\n\n## Vision\n...",
  tech: "# Technical Steering\n\n## Architecture\n...",
  structure: "# Structure Steering\n\n## Organization\n..."
}
```

### get-spec-context

**목적**: 특정 spec에 대한 완전한 컨텍스트를 검색합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 |
| includeContent | boolean | 아니오 | 문서 내용 포함 (기본값: true) |

**반환값**: 완전한 spec 컨텍스트

**응답 구조**:
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

**사용 예제**:
```
"user-authentication spec의 전체 컨텍스트 가져와줘"
```

## Steering 문서 도구

### create-steering-doc

**목적**: 프로젝트 steering 문서(product, tech, structure)를 생성합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| docType | string | 예 | 타입: "product", "tech", 또는 "structure" |
| content | string | 예 | 문서의 Markdown 내용 |

**사용 예제**:
```typescript
{
  docType: "product",
  content: "# Product Steering\n\n## Vision\nBuild the best..."
}
```

**반환값**:
```typescript
{
  success: true,
  message: "Product steering document created",
  path: ".spec-workflow/steering/product.md"
}
```

**참고사항**:
- 필요시 steering 디렉토리 생성
- 기존 steering 문서 덮어쓰기
- steering 문서에는 승인 불필요
- spec 전에 생성되어야 함

## 승인 시스템 도구

### request-approval

**목적**: 문서에 대한 사용자 승인을 요청합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 |
| docType | string | 예 | 승인할 문서 타입 |
| documentId | string | 예 | 추적을 위한 고유 ID |
| content | string | 예 | 검토할 문서 내용 |

**사용 예제**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requirements\n\n..."
}
```

**반환값**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approval requested. Check dashboard to review."
}
```

### get-approval-status

**목적**: 문서의 승인 상태를 확인합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 |
| documentId | string | 예 | 확인할 문서 ID |

**반환값**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Please add more detail about error handling",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**사용 예제**:
```
"user-auth 요구사항의 승인 상태 확인해줘"
```

### delete-approval

**목적**: 완료된 승인 요청을 제거하여 승인 큐를 정리합니다.

**매개변수**:

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| specName | string | 예 | spec의 이름 |
| documentId | string | 예 | 제거할 문서 ID |

**반환값**:
```typescript
{
  success: true,
  message: "Approval record deleted"
}
```

**사용 예제**:
```
"user-auth의 완료된 승인 정리해줘"
```

## 도구 통합 패턴

### 순차적 워크플로우

도구는 순서대로 작동하도록 설계되었습니다:

1. `steering-guide` → steering에 대해 학습
2. `create-steering-doc` → steering 문서 생성
3. `spec-workflow-guide` → 워크플로우 학습
4. `create-spec-doc` → 요구사항 생성
5. `request-approval` → 검토 요청
6. `get-approval-status` → 상태 확인
7. `create-spec-doc` → 설계 생성 (승인 후)
8. `manage-tasks` → 구현 추적

### 병렬 작업

일부 도구는 동시에 사용할 수 있습니다:

- `spec-list` + `spec-status` → 개요 및 세부사항 가져오기
- `get-spec-context` + `get-steering-context` → 전체 프로젝트 컨텍스트
- 여러 `create-spec-doc` → 여러 spec 생성

### 에러 처리

모든 도구는 일관된 에러 구조를 반환합니다:

```typescript
{
  success: false,
  error: "Spec not found",
  details: "No spec named 'invalid-spec' exists",
  suggestion: "Use spec-list to see available specs"
}
```

## 모범 사례

### 도구 선택

1. **정보 수집**:
   - 개요를 위해 `spec-list` 사용
   - 특정 spec을 위해 `spec-status` 사용
   - 구현을 위해 `get-spec-context` 사용

2. **문서 생성**:
   - 항상 요구사항을 먼저 생성
   - 설계 전에 승인 대기
   - 설계 승인 후 작업 생성

3. **작업 관리**:
   - 작업 시작 시 상태 업데이트
   - 완료 즉시 완료로 표시
   - 중요한 컨텍스트를 위한 메모 사용

### 성능 고려사항

- **배치 작업**: 한 대화에서 여러 spec 요청
- **캐싱**: 도구는 성능을 위해 파일 읽기를 캐시
- **선택적 로딩**: 더 빠른 상태 확인을 위해 `includeContent: false` 사용

### 보안

- **경로 검증**: 모든 경로가 검증되고 정제됨
- **프로젝트 격리**: 도구는 프로젝트 디렉토리만 접근
- **입력 정제**: Markdown 내용이 정제됨
- **실행 없음**: 도구는 코드를 실행하지 않음

## 도구 확장

### 사용자 정의 도구 개발

새 도구를 추가하려면:

1. `src/tools/`에 도구 모듈 생성
2. 매개변수 스키마 정의
3. 핸들러 함수 구현
4. MCP 서버에 등록
5. exports에 추가

예제 구조:
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

## 도구 버전 관리

도구는 하위 호환성을 유지합니다:

- 매개변수 추가는 선택 사항
- 응답 구조는 교체가 아닌 확장
- 더 이상 사용되지 않는 기능은 경고 표시
- 마이그레이션 가이드 제공

## 관련 문서

- [사용자 가이드](USER-GUIDE.md) - 도구를 효과적으로 사용하기
- [워크플로우 프로세스](WORKFLOW.md) - 워크플로우에서의 도구 사용
- [프롬프팅 가이드](PROMPTING-GUIDE.md) - 도구 사용 예제
- [개발 가이드](DEVELOPMENT.md) - 새 도구 추가

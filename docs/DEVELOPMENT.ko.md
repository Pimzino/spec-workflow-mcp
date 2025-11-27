# 개발 가이드

이 가이드는 개발 환경 설정, 프로젝트 빌드, 코드 기여 및 Spec Workflow MCP의 아키텍처 이해를 다룹니다.

## 전제 조건

### 필수 소프트웨어

- **Node.js** 18.0 이상
- **npm** 9.0 이상
- **Git** 버전 제어용
- **TypeScript** 지식이 도움됨

### 권장 도구

- **VSCode** TypeScript 확장 포함
- **Chrome/Edge DevTools** 대시보드 디버깅용
- **Postman/Insomnia** API 테스팅용

## 개발 환경 설정

### 1. 리포지토리 복제

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. 의존성 설치

```bash
npm install
```

다음이 설치됩니다:
- MCP SDK
- TypeScript 및 빌드 도구
- 대시보드 서버용 Express
- WebSocket 라이브러리
- 테스팅 프레임워크

### 3. 프로젝트 빌드

```bash
npm run build
```

이는 TypeScript 파일을 `dist/` 디렉터리의 JavaScript로 컴파일합니다.

## 개발 명령어

### 핵심 명령어

| 명령어 | 설명 |
|---------|-------------|
| `npm run dev` | 자동 리로드로 개발 모드 시작 |
| `npm run build` | 프로덕션 번들 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm test` | 테스트 스위트 실행 |
| `npm run clean` | 빌드 산출물 제거 |
| `npm run lint` | 코드 린터 실행 |
| `npm run format` | Prettier로 코드 포맷팅 |

### 개발 모드

```bash
npm run dev
```

기능:
- 파일 변경 시 자동 재컴파일
- 대시보드용 핫 리로드
- 상세한 오류 메시지
- 디버깅용 소스 맵

### 프로덕션용 빌드

```bash
npm run clean && npm run build
```

최적화:
- 압축된 JavaScript
- 최적화된 번들 크기
- 프로덕션 오류 처리
- 성능 개선

## 프로젝트 구조

```
spec-workflow-mcp/
├── src/                    # 소스 코드
│   ├── index.ts           # MCP 서버 진입점
│   ├── server.ts          # 대시보드 서버
│   ├── tools/             # MCP 도구 구현
│   ├── prompts/           # 프롬프트 템플릿
│   ├── utils/             # 유틸리티 함수
│   └── types/             # TypeScript 타입 정의
├── dist/                   # 컴파일된 JavaScript
├── dashboard/             # 웹 대시보드 파일
│   ├── index.html         # 대시보드 UI
│   ├── styles.css         # 대시보드 스타일
│   └── script.js          # 대시보드 JavaScript
├── vscode-extension/      # VSCode 확장 프로그램
│   ├── src/               # 확장 프로그램 소스
│   └── package.json       # 확장 프로그램 매니페스트
├── tests/                 # 테스트 파일
├── docs/                  # 문서
└── package.json           # 프로젝트 구성
```

## 아키텍처 개요

### MCP 서버 아키텍처

```
Client (AI) ↔ MCP Protocol ↔ Server ↔ File System
                              ↓
                          Dashboard
```

### 주요 구성 요소

#### 1. MCP 서버 (`src/index.ts`)
- MCP 프로토콜 통신 처리
- 도구 요청 처리
- 프로젝트 상태 관리
- 파일 시스템 작업

#### 2. 대시보드 서버 (`src/server.ts`)
- 웹 대시보드 제공
- WebSocket 연결
- 실시간 업데이트
- HTTP API 엔드포인트

#### 3. 도구 (`src/tools/`)
각 도구는 별도 모듈:
- 입력 검증
- 비즈니스 로직
- 파일 작업
- 응답 포맷팅

#### 4. 프롬프트 (`src/prompts/`)
다음을 위한 템플릿 문자열:
- 문서 생성
- 워크플로우 가이드
- 오류 메시지
- 사용자 지침

## 새 기능 구현

### 새 도구 추가

1. **`src/tools/`에 도구 파일 생성**:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: '도구가 수행하는 작업 설명',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '매개변수 설명' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // 도구 구현
    const { param1, param2 = 0 } = params;

    // 여기에 비즈니스 로직

    return {
      success: true,
      data: '도구 응답'
    };
  }
};
```

2. **인덱스에 등록** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **서버에 추가** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### 대시보드 기능 추가

1. **HTML 업데이트** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>새 기능</h3>
  <button id="new-action">작업</button>
</div>
```

2. **JavaScript 추가** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // 기능 로직
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **서버에서 처리** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // 새 작업 처리
  }
});
```

## 테스팅

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- src/tools/my-tool.test.ts

# 커버리지와 함께 실행
npm run test:coverage

# 감시 모드
npm run test:watch
```

### 테스트 작성

소스 파일 옆에 테스트 파일 생성:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('should process input correctly', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('should handle errors', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 통합 테스팅

완전한 워크플로우 테스트:

```typescript
// tests/integration/workflow.test.ts
describe('Complete Workflow', () => {
  it('should create spec from start to finish', async () => {
    // 요구사항 생성
    // 요구사항 승인
    // 설계 생성
    // 설계 승인
    // 작업 생성
    // 구조 검증
  });
});
```

## 디버깅

### MCP 서버 디버그

1. **디버그 출력 추가**:

```typescript
console.error('[DEBUG]', 'Tool called:', toolName, params);
```

2. **VSCode 디버거 사용**:

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

### 대시보드 디버그

1. **브라우저 DevTools**:
   - 브라우저에서 대시보드 열기
   - F12를 눌러 DevTools 열기
   - 오류에 대한 콘솔 확인
   - WebSocket에 대한 네트워크 탭 모니터링

2. **로깅 추가**:

```javascript
console.log('WebSocket message:', message);
console.log('State update:', newState);
```

## 코드 스타일 및 표준

### TypeScript 가이드라인

- strict 모드 사용
- 데이터 구조에 대한 인터페이스 정의
- `any` 타입 사용 회피
- 콜백 대신 async/await 사용

### 파일 구성

- 파일당 하나의 구성 요소
- 관련 기능 그룹화
- 명확한 명명 규칙
- 포괄적인 주석

### 명명 규칙

- **파일**: kebab-case (`my-tool.ts`)
- **클래스**: PascalCase (`SpecManager`)
- **함수**: camelCase (`createSpec`)
- **상수**: UPPER_SNAKE (`MAX_RETRIES`)

## 기여

### 기여 프로세스

1. **리포지토리 포크**
2. **기능 브랜치 생성**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **변경 사항 만들기**
4. **테스트 작성**
5. **테스트 및 린트 실행**:
   ```bash
   npm test
   npm run lint
   ```
6. **변경 사항 커밋**:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **브랜치 푸시**:
   ```bash
   git push origin feature/my-feature
   ```
8. **Pull Request 생성**

### 커밋 메시지 형식

conventional commits 따르기:

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서
- `style:` 포맷팅
- `refactor:` 코드 재구조화
- `test:` 테스팅
- `chore:` 유지보수

예제:
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### Pull Request 가이드라인

- 명확한 설명
- 관련 이슈 참조
- UI 변경 사항에 대한 스크린샷 포함
- 모든 테스트 통과 확인
- 문서 업데이트

## 퍼블리싱

### NPM 패키지

1. **버전 업데이트**:
   ```bash
   npm version patch|minor|major
   ```

2. **패키지 빌드**:
   ```bash
   npm run build
   ```

3. **퍼블리시**:
   ```bash
   npm publish
   ```

### VSCode 확장 프로그램

1. **`vscode-extension/package.json`에서 확장 프로그램 버전 업데이트**

2. **확장 프로그램 빌드**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **마켓플레이스에 퍼블리시**:
   ```bash
   vsce publish
   ```

## 성능 최적화

### 서버 성능

- 파일 읽기에 캐싱 사용
- 파일 감시자에 디바운싱 구현
- WebSocket 메시지 배칭 최적화
- 대용량 문서 지연 로딩

### 대시보드 성능

- DOM 업데이트 최소화
- 긴 목록에 가상 스크롤링 사용
- 프로그레시브 렌더링 구현
- WebSocket 재연결 최적화

## 보안 고려사항

### 입력 검증

항상 도구 입력 검증:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Invalid spec name');
}

// 파일 경로 정리
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Invalid path');
}
```

### 파일 시스템 보안

- 프로젝트 디렉터리로 작업 제한
- 모든 파일 경로 검증
- 안전한 파일 작업 사용
- 권한 검사 구현

## 개발 문제 해결

### 일반적인 빌드 오류

| 오류 | 해결책 |
|-------|----------|
| TypeScript 오류 | 상세 오류를 보려면 `npm run build` 실행 |
| 모듈을 찾을 수 없음 | 가져오기 확인 및 `npm install` 실행 |
| 포트가 이미 사용 중 | 포트 변경 또는 기존 프로세스 종료 |
| WebSocket 연결 실패 | 서버가 실행 중이고 포트가 올바른지 확인 |

### 개발 팁

1. 더 나은 타입 안전성을 위해 **TypeScript strict 모드 사용**
2. 더 쉬운 디버깅을 위해 **소스 맵 활성화**
3. 개발 중 자동 재시작을 위해 **nodemon 사용**
4. 격리된 디렉터리에서 **파일 작업 테스트**
5. Chrome DevTools로 **성능 모니터링**

## 리소스

- [MCP SDK Documentation](https://github.com/anthropics/mcp-sdk)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode Extension API](https://code.visualstudio.com/api)

## 관련 문서

- [구성 가이드](CONFIGURATION.md) - 서버 구성
- [사용자 가이드](USER-GUIDE.md) - 서버 사용
- [도구 참조](TOOLS-REFERENCE.md) - 도구 문서
- [문제 해결](TROUBLESHOOTING.md) - 일반적인 문제

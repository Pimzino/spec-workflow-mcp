# 구성 가이드

이 가이드는 Spec Workflow MCP의 모든 구성 옵션을 다룹니다.

## 명령줄 옵션

### 기본 사용법

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [options]
```

### 사용 가능한 옵션

| 옵션 | 설명 | 예제 |
|--------|-------------|---------|
| `--help` | 포괄적인 사용 정보 표시 | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | 대시보드 전용 모드 실행 (기본 포트: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <number>` | 사용자 지정 대시보드 포트 지정 (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### 중요 참고사항

- **단일 대시보드 인스턴스**: 한 번에 하나의 대시보드만 실행됩니다. 모든 MCP 서버가 동일한 대시보드에 연결됩니다.
- **기본 포트**: 대시보드는 기본적으로 포트 5000을 사용합니다. 5000이 사용 불가능한 경우에만 `--port`를 사용하세요.
- **별도 대시보드**: 항상 MCP 서버와 별도로 대시보드를 실행하세요.

## 사용 예제

### 일반적인 워크플로우

1. **대시보드 시작** (먼저 한 번만 수행):
```bash
# 기본 포트 5000 사용
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **MCP 서버 시작** (프로젝트당 하나, 별도 터미널에서):
```bash
# 프로젝트 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# 프로젝트 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# 프로젝트 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

모든 프로젝트가 http://localhost:5000 의 대시보드에 표시됩니다.

### 사용자 지정 포트가 있는 대시보드

포트 5000을 사용할 수 없는 경우에만 사용자 지정 포트를 사용하세요:

```bash
# 포트 8080에서 대시보드 시작
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## 환경 변수

### SPEC_WORKFLOW_HOME

기본 전역 상태 디렉터리(`~/.spec-workflow-mcp`)를 재정의합니다. `$HOME`이 읽기 전용인 샌드박스 환경에 유용합니다.

| 변수 | 기본값 | 설명 |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | 전역 상태 파일을 위한 디렉터리 |

**이 디렉터리에 저장되는 파일:**
- `activeProjects.json` - 프로젝트 레지스트리
- `activeSession.json` - 대시보드 세션 정보
- `settings.json` - 전역 설정
- `job-execution-history.json` - 작업 실행 기록
- `migration.log` - 구현 로그 마이그레이션 추적

**사용 예제:**

```bash
# 절대 경로
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# 상대 경로 (현재 작업 디렉터리에 대해 확인됨)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# 대시보드 모드용
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**샌드박스 환경 (예: Codex CLI):**

`sandbox_mode=workspace-write`가 있는 Codex CLI와 같은 샌드박스 환경에서 실행할 때 `SPEC_WORKFLOW_HOME`을 작업 공간 내의 쓰기 가능한 위치로 설정하세요:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## 대시보드 세션 관리

대시보드는 세션 정보를 `~/.spec-workflow-mcp/activeSession.json`(또는 설정된 경우 `$SPEC_WORKFLOW_HOME/activeSession.json`)에 저장합니다. 이 파일은:
- 단일 대시보드 인스턴스 강제 적용
- MCP 서버가 실행 중인 대시보드를 찾을 수 있도록 허용
- 대시보드가 중지되면 자동으로 정리

### 단일 인스턴스 강제 적용

한 번에 하나의 대시보드만 실행할 수 있습니다. 두 번째 대시보드를 시작하려고 하면:

```
대시보드가 이미 실행 중입니다: http://localhost:5000

다음을 수행할 수 있습니다:
  1. 기존 대시보드 사용: http://localhost:5000
  2. 먼저 중지한 다음(Ctrl+C 또는 PID 종료) 새 대시보드 시작

참고: 모든 프로젝트에 하나의 대시보드 인스턴스만 필요합니다.
```

## 포트 관리

**기본 포트**: 5000
**사용자 지정 포트**: 포트 5000을 사용할 수 없는 경우에만 `--port <number>` 사용

### 포트 충돌

포트 5000이 다른 서비스에서 이미 사용 중인 경우:

```bash
대시보드 시작 실패: 포트 5000이 이미 사용 중입니다.

포트 5000을 사용하는 다른 서비스일 수 있습니다.
다른 포트를 사용하려면:
  spec-workflow-mcp --dashboard --port 8080
```

## 구성 파일 (사용 중단됨)

### 기본 위치

서버는 다음 위치에서 구성을 찾습니다: `<project-dir>/.spec-workflow/config.toml`

### 파일 형식

구성은 TOML 형식을 사용합니다. 완전한 예제:

```toml
# 프로젝트 디렉터리 (기본값은 현재 디렉터리)
projectDir = "/path/to/your/project"

# 대시보드 포트 (1024-65535)
port = 3456

# 대시보드 전용 모드 실행
dashboardOnly = false

# 인터페이스 언어
# 옵션: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "en"

# 사운드 알림 (VSCode 확장 프로그램만)
[notifications]
enabled = true
volume = 0.5

# 고급 설정
[advanced]
# WebSocket 재연결 시도
maxReconnectAttempts = 10

# 파일 감시자 설정
[watcher]
enabled = true
debounceMs = 300
```

### 구성 옵션

#### 기본 설정

| 옵션 | 유형 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `projectDir` | string | 현재 디렉터리 | 프로젝트 디렉터리 경로 |
| `port` | number | 임시 | 대시보드 포트 (1024-65535) |
| `dashboardOnly` | boolean | false | MCP 서버 없이 대시보드 실행 |
| `lang` | string | "en" | 인터페이스 언어 |

> **참고**: `autoStartDashboard` 옵션은 v2.0.0에서 제거되었습니다. 대시보드는 이제 `--dashboard` 플래그를 통해 액세스할 수 있는 통합 다중 프로젝트 모드를 사용합니다.

#### 언어 옵션

- `en` - English
- `ja` - Japanese (日本語)
- `zh` - Chinese (中文)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)
- `de` - German (Deutsch)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `it` - Italian (Italiano)
- `ko` - Korean (한국어)
- `ar` - Arabic (العربية)

### 사용자 지정 구성 생성

1. 예제 구성 복사:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. 구성 편집:
```toml
# 내 프로젝트 구성
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "en"
```

3. 구성 사용:
```bash
# .spec-workflow/config.toml 자동 사용
npx -y @pimzino/spec-workflow-mcp@latest

# 또는 명시적으로 지정
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## 구성 우선순위

구성 값은 다음 순서로 적용됩니다 (우선순위가 높은 것부터):

1. **명령줄 인수** - 항상 우선
2. **사용자 지정 구성 파일** - `--config`로 지정
3. **기본 구성 파일** - `.spec-workflow/config.toml`
4. **내장 기본값** - 폴백 값

### 예제 우선순위

```toml
# config.toml
port = 3000
```

```bash
# 명령줄 인수가 구성 파일 재정의
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# 결과: port = 4000 (CLI 승리)
```

## 환경별 구성

### 개발 구성

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "en"

[advanced]
debugMode = true
verboseLogging = true
```

사용법:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### 프로덕션 구성

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "en"

[advanced]
debugMode = false
verboseLogging = false
```

사용법:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## 포트 구성

### 유효한 포트 범위

포트는 1024에서 65535 사이여야 합니다.

### 임시 포트

포트가 지정되지 않은 경우 시스템이 자동으로 사용 가능한 임시 포트를 선택합니다. 다음에 권장됩니다:
- 개발 환경
- 여러 동시 프로젝트
- 포트 충돌 방지

### 고정 포트

다음이 필요할 때 고정 포트 사용:
- 북마크를 위한 일관된 URL
- 다른 도구와의 통합
- 공유 구성을 통한 팀 협업

### 포트 충돌 해결

포트가 이미 사용 중인 경우:

1. **포트를 사용하는 것 확인:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **해결책:**
   - 다른 포트 사용: `--port 3001`
   - 포트를 사용하는 프로세스 종료
   - `--port`를 생략하여 임시 포트 사용

## 다중 프로젝트 설정

### 별도 구성

프로젝트별 구성 생성:

```bash
# 프로젝트 A
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# 프로젝트 B
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### 공유 구성

재정의가 있는 공유 구성 사용:

```bash
# 공유 기본 구성
~/configs/spec-workflow-base.toml

# 프로젝트별 재정의
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## VSCode 확장 프로그램 구성

VSCode 확장 프로그램에는 자체 설정이 있습니다:

1. VSCode 설정 열기 (Cmd/Ctrl + ,)
2. "Spec Workflow" 검색
3. 구성:
   - 언어 기본 설정
   - 사운드 알림
   - 아카이브 가시성
   - 자동 새로고침 간격

## 구성 문제 해결

### 구성이 로드되지 않음

1. **파일 위치 확인:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **TOML 구문 검증:**
   ```bash
   # TOML CLI 도구 설치
   npm install -g @iarna/toml

   # 검증
   toml .spec-workflow/config.toml
   ```

3. **권한 확인:**
   ```bash
   # 파일이 읽기 가능한지 확인
   chmod 644 .spec-workflow/config.toml
   ```

### 일반적인 문제

| 문제 | 해결책 |
|-------|----------|
| 포트가 이미 사용 중 | 다른 포트 사용 또는 임시 포트 사용을 위해 생략 |
| 구성 파일을 찾을 수 없음 | 경로 확인 및 필요한 경우 절대 경로 사용 |
| 잘못된 TOML 구문 | TOML 린터로 검증 |
| 설정이 적용되지 않음 | 구성 우선순위 확인 |

## 모범 사례

1. 구성 파일에 **버전 제어 사용**
2. 프로젝트 README에 **사용자 지정 설정 문서화**
3. 개발에서 **임시 포트 사용**
4. 구성 파일에서 **민감한 데이터 제외**
5. **환경별** 구성 생성
6. 배포 전 **구성 변경 사항 테스트**

## 관련 문서

- [사용자 가이드](USER-GUIDE.md) - 구성된 서버 사용
- [인터페이스 가이드](INTERFACES.md) - 대시보드 및 확장 프로그램 설정
- [문제 해결](TROUBLESHOOTING.md) - 일반적인 구성 문제

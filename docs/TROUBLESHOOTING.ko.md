# 문제 해결 가이드

이 가이드는 Spec Workflow MCP의 일반적인 문제를 해결하는 데 도움이 됩니다.

## 빠른 진단

### 설치 확인
```bash
# npm 패키지 접근 가능 여부 확인
npx -y @pimzino/spec-workflow-mcp@latest --help

# 올바른 디렉토리에서 실행 중인지 확인
pwd  # 또는 Windows에서 'cd'

# .spec-workflow 디렉토리 존재 확인
ls -la .spec-workflow  # 또는 Windows에서 'dir .spec-workflow'
```

### 서비스 확인
```bash
# MCP 서버 테스트
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# 대시보드 테스트
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# 포트 가용성 확인
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## 일반적인 문제 및 해결 방법

## 설치 문제

### NPM 패키지를 찾을 수 없음

**에러**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**해결 방법**:
1. 인터넷 연결 확인
2. npm 캐시 정리:
   ```bash
   npm cache clean --force
   ```
3. 버전 태그 없이 시도:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. 먼저 전역 설치:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### 권한 거부됨

**에러**: `EACCES: permission denied`

**해결 방법**:
1. **macOS/Linux**: 적절한 npm 권한 사용:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: 관리자로 실행하거나 npm 권한 수정:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. -y 플래그와 함께 npx 사용:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## MCP 서버 문제

### 서버가 시작되지 않음

**에러**: `Failed to start MCP server`

**해결 방법**:
1. Node.js 버전 확인:
   ```bash
   node --version  # 18.0 이상이어야 함
   ```
2. 프로젝트 경로 존재 확인:
   ```bash
   ls -la /path/to/project
   ```
3. 충돌하는 프로세스 확인:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. 절대 경로로 시도:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP가 AI 도구에 연결되지 않음

**에러**: `MCP server unreachable` 또는 `Connection refused`

**해결 방법**:

1. **Claude Desktop**: 구성 파일 확인:
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

2. **Claude Code CLI**: 설정 확인:
   ```bash
   claude mcp list  # spec-workflow가 나열되는지 확인
   claude mcp remove spec-workflow  # 존재하면 제거
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **경로 문제**: 경로가 절대 경로이고 존재하는지 확인:
   - ❌ `~/project` 또는 `./project`
   - ✅ `/Users/name/project` 또는 `C:\Users\name\project`

### 도구를 사용할 수 없음

**에러**: `Tool 'spec-workflow' not found`

**해결 방법**:
1. AI 도구를 완전히 재시작
2. MCP 서버가 실행 중인지 확인 (프로세스 확인)
3. 구성이 올바르게 저장되었는지 확인
4. 도구를 명시적으로 언급 시도: "spec-workflow를 사용해서 spec 만들어줘"

## 대시보드 문제

### 대시보드가 로드되지 않음

**에러**: `Cannot connect to dashboard` 또는 빈 페이지

**해결 방법**:
1. 대시보드가 시작되었는지 확인:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. 브라우저에서 URL 확인 (포트 확인):
   ```
   http://localhost:3000  # 또는 표시된 포트
   ```
3. 다른 브라우저 또는 시크릿 모드 시도
4. 브라우저 콘솔에서 에러 확인 (F12 → Console)
5. 일시적으로 브라우저 확장 비활성화

### 포트가 이미 사용 중

**에러**: `Error: listen EADDRINUSE: address already in use :::3000`

**해결 방법**:
1. 다른 포트 사용:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. 포트를 사용하는 프로세스 찾아 종료:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. 임시 포트 사용 (--port 플래그 생략):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### WebSocket 연결 실패

**에러**: `WebSocket connection lost` 또는 실시간 업데이트가 작동하지 않음

**해결 방법**:
1. 브라우저 페이지 새로고침
2. 방화벽이 WebSocket을 차단하는지 확인
3. 대시보드와 MCP 서버가 동일한 프로젝트에서 실행되는지 확인
4. 브라우저 콘솔에서 특정 에러 확인
5. 다른 네트워크 시도 (기업 네트워크인 경우)

### 대시보드가 업데이트되지 않음

**증상**: 변경사항이 실시간으로 반영되지 않음

**해결 방법**:
1. 브라우저 강력 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. 브라우저 캐시 삭제
3. WebSocket 연결 상태 확인 (녹색으로 표시되어야 함)
4. 파일 시스템 감시자가 작동하는지 확인:
   ```bash
   # 프로젝트에 테스트 파일 생성
   touch .spec-workflow/test.md
   # 대시보드에서 업데이트 트리거되어야 함
   ```

## 승인 시스템 문제

### 승인이 표시되지 않음

**에러**: 대시보드에 승인 알림이 없음

**해결 방법**:
1. MCP 서버와 함께 대시보드가 실행 중인지 확인:
   ```bash
   # 별도로 실행
   # 터미널 1: 대시보드 시작
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # 터미널 2: MCP 서버 시작
   npx -y @pimzino/spec-workflow-mcp@latest /path
   ```
2. 승인 디렉토리 존재 확인:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. AI를 통해 수동으로 승인 요청 트리거

### 문서를 승인할 수 없음

**에러**: 승인 버튼이 작동하지 않음

**해결 방법**:
1. 브라우저 콘솔에서 JavaScript 에러 확인
2. 올바른 spec 페이지에 있는지 확인
3. 문서가 승인 대기 상태인지 확인
4. 대신 VSCode 확장 사용 시도 (사용 가능한 경우)

## 파일 시스템 문제

### Spec 파일이 생성되지 않음

**에러**: Spec 문서가 파일 시스템에 나타나지 않음

**해결 방법**:
1. 쓰기 권한 확인:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. 올바른 작업 디렉토리 확인:
   ```bash
   pwd  # 프로젝트 루트여야 함
   ```
3. 숨겨진 파일 찾기:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. 백신 프로그램이 파일 생성을 차단하는지 확인

### 파일 권한 거부됨

**에러**: spec 생성 시 `EACCES` 또는 `Permission denied`

**해결 방법**:
1. 디렉토리 권한 수정:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. 파일 소유권 확인:
   ```bash
   ls -la .spec-workflow
   # 사용자가 소유해야 함
   ```
3. 소유한 디렉토리에서 실행 (시스템 디렉토리가 아님)

## VSCode 확장 문제

### 확장이 로드되지 않음

**에러**: Activity Bar에 Spec Workflow 아이콘이 나타나지 않음

**해결 방법**:
1. 확장이 설치되었는지 확인:
   - 확장 열기 (Ctrl+Shift+X)
   - "Spec Workflow MCP" 검색
   - 설치 및 활성화 여부 확인
2. VSCode 창 새로고침:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. 확장 출력 확인:
   - View → Output → 드롭다운에서 "Spec Workflow" 선택
4. 프로젝트에 `.spec-workflow` 디렉토리가 있는지 확인

### 확장 명령이 작동하지 않음

**에러**: 명령이 실패하거나 에러 표시

**해결 방법**:
1. `.spec-workflow`를 포함하는 프로젝트 폴더 열기
2. VSCode가 올바른 작업 공간을 사용하는지 확인
3. 특정 에러에 대한 확장 로그 보기
4. 확장 재설치 시도:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## 구성 문제

### 구성 파일이 로드되지 않음

**에러**: config.toml의 설정이 적용되지 않음

**해결 방법**:
1. TOML 구문 확인:
   ```bash
   # TOML 검증기 설치
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. 파일 위치 확인:
   - 기본값: `.spec-workflow/config.toml`
   - 사용자 정의: `--config` 플래그 사용
3. 구문 에러가 없는지 확인:
   ```toml
   # 올바름
   port = 3000
   lang = "en"

   # 잘못됨
   port: 3000  # : 대신 = 사용해야 함
   lang = en   # 따옴표가 있어야 함
   ```

### 명령줄 인수가 작동하지 않음

**에러**: `--port`와 같은 플래그가 무시됨

**해결 방법**:
1. 인수 순서 확인:
   ```bash
   # 올바름
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # 잘못됨
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. 플래그 값이 유효한지 확인:
   - Port: 1024-65535
   - Language: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. 모든 옵션을 보려면 `--help` 사용

## 성능 문제

### 느린 응답 시간

**증상**: 대시보드 또는 도구가 느리게 응답

**해결 방법**:
1. 시스템 리소스 확인:
   ```bash
   # CPU 및 메모리 사용량
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. 대규모 프로젝트에서 파일 감시자 줄이기:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. 오래된 승인 레코드 정리:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. 모든 것을 나열하는 대신 특정 spec 이름 사용

### 높은 메모리 사용량

**해결 방법**:
1. 주기적으로 서비스 재시작
2. 대시보드 새로고침 빈도 제한:
   ```json
   // VSCode 설정
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. 완료된 spec 아카이브
4. 대시보드용 브라우저 캐시 삭제

## 네트워크 문제

### 기업 프록시 뒤

**해결 방법**:
1. npm 프록시 구성:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. 로컬 설치 사용:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### 방화벽이 연결 차단

**해결 방법**:
1. 방화벽을 통해 Node.js 허용
2. 0.0.0.0 대신 localhost 사용
3. 특정 포트 규칙 구성
4. 다른 포트 범위 시도

## 플랫폼별 문제

### Windows

#### 경로 형식 문제
**에러**: `Invalid path` 또는 경로를 찾을 수 없음

**해결 방법**:
```bash
# 슬래시 사용
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# 또는 이스케이프된 백슬래시
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### PowerShell 실행 정책
**에러**: `cannot be loaded because running scripts is disabled`

**해결 방법**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeper 차단
**에러**: `cannot be opened because the developer cannot be verified`

**해결 방법**:
1. 시스템 환경설정 → 보안 및 개인정보 보호 → 허용
2. 또는 격리 제거:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### 누락된 종속성
**에러**: `shared library not found`

**해결 방법**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## 도움 받기

### 진단 정보

문제를 보고할 때 다음을 포함하세요:

1. **시스템 정보**:
   ```bash
   node --version
   npm --version
   uname -a  # 또는 Windows에서 'ver'
   ```

2. **에러 메시지**:
   - 완전한 에러 텍스트
   - 시각적 문제인 경우 스크린샷
   - 브라우저 콘솔 로그

3. **구성**:
   - MCP 클라이언트 구성
   - config.toml 내용
   - 사용된 명령줄

4. **재현 단계**:
   - 실행한 정확한 명령
   - 예상 동작
   - 실제 동작

### 지원 채널

1. **GitHub Issues**: [이슈 생성](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **문서**: `/docs`의 다른 가이드 확인
3. **커뮤니티**: 토론 및 Q&A

### 디버그 모드

상세 로깅 활성화:

```bash
# 환경 변수 설정
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# 디버그 출력과 함께 실행
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## 예방 팁

### 모범 사례

1. **구성에서 항상 절대 경로 사용**
2. **Node.js를 최신 상태로 유지** (v18+ 필요)
3. **프로젝트 루트 디렉토리에서 실행**
4. **옵션 확인을 위해 --help 사용**
5. **문제 발생 시 깨끗한 환경에서 테스트**
6. **실패를 가정하기 전에 로그 확인**
7. **정기적으로 .spec-workflow 디렉토리 백업**

### 정기적인 유지보수

1. 매월 오래된 승인 정리
2. 완료된 spec 아카이브
3. npm 패키지 정기적으로 업데이트
4. 로그용 디스크 공간 모니터링
5. 업데이트 후 서비스 재시작

## 관련 문서

- [구성 가이드](CONFIGURATION.md) - 상세한 구성 옵션
- [사용자 가이드](USER-GUIDE.md) - 일반 사용 지침
- [개발 가이드](DEVELOPMENT.md) - 수정 사항 기여
- [인터페이스 가이드](INTERFACES.md) - 대시보드 및 확장 세부사항

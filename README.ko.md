# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

실시간 대시보드와 VSCode 확장 프로그램을 갖춘 구조화된 스펙 기반 개발을 위한 Model Context Protocol(MCP) 서버입니다.

## ☕ 이 프로젝트 후원하기

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 쇼케이스

### 🔄 승인 시스템 작동 영상
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*승인 시스템 작동 방식 확인: 문서 생성, 대시보드를 통한 승인 요청, 피드백 제공, 수정사항 추적.*

### 📊 대시보드 및 스펙 관리
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*실시간 대시보드 탐색: 스펙 보기, 진행 상황 추적, 문서 탐색, 개발 워크플로우 모니터링.*

## ✨ 주요 기능

- **구조화된 개발 워크플로우** - 순차적 스펙 생성 (요구사항 → 설계 → 작업)
- **실시간 웹 대시보드** - 실시간 업데이트로 스펙, 작업 및 진행 상황 모니터링
- **VSCode 확장 프로그램** - VSCode 사용자를 위한 통합 사이드바 대시보드
- **승인 워크플로우** - 수정사항이 포함된 완전한 승인 프로세스
- **작업 진행 추적** - 시각적 진행률 표시줄 및 상세 상태
- **구현 로그** - 코드 통계가 포함된 모든 작업 구현의 검색 가능한 로그
- **다국어 지원** - 11개 언어로 제공

## 🌍 지원 언어

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 빠른 시작

### 1단계: AI 도구에 추가

MCP 구성에 추가 (아래 클라이언트별 설정 참조):

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

### 2단계: 인터페이스 선택

**옵션 A: 웹 대시보드** (CLI 사용자 필수)
대시보드 시작 (기본 포트 5000):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

대시보드는 http://localhost:5000 에서 액세스할 수 있습니다.

> **참고:** 하나의 대시보드 인스턴스만 필요합니다. 모든 프로젝트가 동일한 대시보드에 연결됩니다.

**옵션 B: VSCode 확장 프로그램** (VSCode 사용자 권장)

VSCode 마켓플레이스에서 [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)을 설치하세요.

## 📝 사용 방법

대화에서 spec-workflow를 언급하기만 하면 됩니다:

- **"사용자 인증을 위한 스펙 생성"** - 완전한 스펙 워크플로우 생성
- **"내 스펙 목록 보기"** - 모든 스펙과 상태 표시
- **"user-auth 스펙의 작업 1.2 실행"** - 특정 작업 실행

[더 많은 예제 보기 →](docs/PROMPTING-GUIDE.md)

## 🔧 MCP 클라이언트 설정

<details>
<summary><strong>Augment Code</strong></summary>

Augment 설정에서 구성:
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

MCP 구성에 추가:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**중요 참고사항:**
- `-y` 플래그는 더 원활한 설치를 위해 npm 프롬프트를 우회합니다
- `--` 구분자는 경로가 npx가 아닌 spec-workflow 스크립트에 전달되도록 합니다
- `/path/to/your/project`를 실제 프로젝트 디렉터리 경로로 바꾸세요

**Windows용 대안 (위 방법이 작동하지 않는 경우):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

`claude_desktop_config.json`에 추가:
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

> **중요:** MCP 서버를 시작하기 전에 `--dashboard`로 대시보드를 별도로 실행하세요.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

MCP 서버 구성에 추가:
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

Continue 구성에 추가:
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

Cursor 설정(`settings.json`)에 추가:
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

`opencode.json` 구성 파일에 추가:
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

`~/.codeium/windsurf/mcp_config.json` 구성 파일에 추가:
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

`~/.codex/config.toml` 구성 파일에 추가:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Docker 배포

격리된 배포를 위해 Docker 컨테이너에서 대시보드 실행:

```bash
# Docker Compose 사용 (권장)
cd containers
docker-compose up --build

# 또는 Docker CLI 사용
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

대시보드는 http://localhost:5000 에서 사용 가능합니다.

[Docker 설정 가이드 보기 →](containers/README.md)

## 🔒 샌드박스 환경

`$HOME`이 읽기 전용인 샌드박스 환경(예: `sandbox_mode=workspace-write`가 있는 Codex CLI)의 경우 `SPEC_WORKFLOW_HOME` 환경 변수를 사용하여 전역 상태 파일을 쓰기 가능한 위치로 리디렉션하세요:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[구성 가이드 보기 →](docs/CONFIGURATION.md#environment-variables)

## 📚 문서

- [구성 가이드](docs/CONFIGURATION.md) - 명령줄 옵션, 구성 파일
- [사용자 가이드](docs/USER-GUIDE.md) - 포괄적인 사용 예제
- [워크플로우 프로세스](docs/WORKFLOW.md) - 개발 워크플로우 및 모범 사례
- [인터페이스 가이드](docs/INTERFACES.md) - 대시보드 및 VSCode 확장 프로그램 상세 정보
- [프롬프팅 가이드](docs/PROMPTING-GUIDE.md) - 고급 프롬프팅 예제
- [도구 참조](docs/TOOLS-REFERENCE.md) - 완전한 도구 문서
- [개발](docs/DEVELOPMENT.md) - 기여 및 개발 설정
- [문제 해결](docs/TROUBLESHOOTING.md) - 일반적인 문제 및 해결책

## 📁 프로젝트 구조

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

## 🛠️ 개발

```bash
# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 개발 모드로 실행
npm run dev
```

[개발 가이드 보기 →](docs/DEVELOPMENT.md)

## 📄 라이선스

GPL-3.0

## ⭐ 스타 히스토리

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>

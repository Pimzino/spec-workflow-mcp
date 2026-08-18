# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

リアルタイムダッシュボードとVSCode拡張機能を備えた、構造化された仕様駆動開発のためのModel Context Protocol (MCP) サーバーです。

## ☕ このプロジェクトを支援する

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 ショーケース

### 🔄 承認システムの動作

<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*承認システムの動作をご覧ください：ドキュメント作成、ダッシュボードでの承認リクエスト、フィードバック提供、改訂の追跡。*

### 📊 ダッシュボードと仕様管理

<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*リアルタイムダッシュボードを探索：仕様の表示、進捗の追跡、ドキュメントのナビゲート、開発ワークフローの監視。*

## ✨ 主な機能

- **構造化された開発ワークフロー** - 順次仕様作成（要件 → 設計 → タスク）
- **リアルタイムWebダッシュボード** - ライブ更新で仕様、タスク、進捗を監視
- **VSCode拡張機能** - VSCodeユーザー向けの統合サイドバーダッシュボード
- **承認ワークフロー** - 改訂を含む完全な承認プロセス
- **タスク進捗追跡** - ビジュアル進捗バーと詳細なステータス
- **実装ログ** - コード統計を含むすべてのタスク実装の検索可能なログ
- **多言語サポート** - 11言語で利用可能

## 🌍 サポート言語

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 クイックスタート

### ステップ1: AIツールに追加する

MCP設定に追加します（以下のクライアント固有のセットアップを参照）：

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

### ステップ2: インターフェースを選択する

**オプションA: Webダッシュボード**（CLIユーザーに必須）
ダッシュボードを起動します（デフォルトポート5000で実行）：
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

ダッシュボードは以下のURLでアクセス可能です：http://localhost:5000

> **注意：** ダッシュボードインスタンスは1つだけ必要です。すべてのプロジェクトが同じダッシュボードに接続します。

**オプションB: VSCode拡張機能**（VSCodeユーザーに推奨）

VSCodeマーケットプレイスから[Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)をインストールします。

## 📝 使い方

会話でspec-workflowに言及するだけです：

- **「ユーザー認証の仕様を作成して」** - 完全な仕様ワークフローを作成
- **「仕様一覧を表示して」** - すべての仕様とそのステータスを表示
- **「user-auth仕様のタスク1.2を実行して」** - 特定のタスクを実行

[その他の例を見る →](docs/PROMPTING-GUIDE.ja.md)

## 🔧 MCPクライアントセットアップ

<details>
<summary><strong>Augment Code</strong></summary>

Augment設定で設定します：
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

MCP設定に追加します：
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**重要な注意事項：**
- `-y`フラグは、スムーズなインストールのためにnpmプロンプトをバイパスします
- `--`区切り文字により、パスがnpxではなくspec-workflowスクリプトに渡されます
- `/path/to/your/project`を実際のプロジェクトディレクトリパスに置き換えてください

**Windows用の代替方法（上記が機能しない場合）：**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

`claude_desktop_config.json`に追加します：
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

> **重要：** MCPサーバーを起動する前に、`--dashboard`を使用してダッシュボードを別途実行してください。

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

MCPサーバー設定に追加します：
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

Continue設定に追加します：
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

Cursor設定（`settings.json`）に追加します：
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

`opencode.json`設定ファイルに追加します：
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

`~/.codeium/windsurf/mcp_config.json`設定ファイルに追加します：
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

`~/.codex/config.toml`設定ファイルに追加します：
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Dockerデプロイ

Dockerコンテナでダッシュボードを実行し、分離されたデプロイを実現します：

```bash
# Docker Composeを使用（推奨）
cd containers
docker-compose up --build

# またはDocker CLIを使用
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

ダッシュボードは以下のURLで利用可能になります：http://localhost:5000

[Dockerセットアップガイドを見る →](containers/README.md)

## 🔒 サンドボックス環境

`$HOME`が読み取り専用のサンドボックス環境（例：Codex CLIの`sandbox_mode=workspace-write`）の場合、`SPEC_WORKFLOW_HOME`環境変数を使用してグローバル状態ファイルを書き込み可能な場所にリダイレクトします：

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[設定ガイドを見る →](docs/CONFIGURATION.ja.md#environment-variables)

## 📚 ドキュメント

- [設定ガイド](docs/CONFIGURATION.ja.md) - コマンドラインオプション、設定ファイル
- [ユーザーガイド](docs/USER-GUIDE.ja.md) - 包括的な使用例
- [ワークフロープロセス](docs/WORKFLOW.ja.md) - 開発ワークフローとベストプラクティス
- [インターフェースガイド](docs/INTERFACES.ja.md) - ダッシュボードとVSCode拡張機能の詳細
- [プロンプティングガイド](docs/PROMPTING-GUIDE.ja.md) - 高度なプロンプティング例
- [ツールリファレンス](docs/TOOLS-REFERENCE.ja.md) - 完全なツールドキュメント
- [開発](docs/DEVELOPMENT.ja.md) - 貢献と開発セットアップ
- [トラブルシューティング](docs/TROUBLESHOOTING.ja.md) - 一般的な問題と解決策

## 📁 プロジェクト構造

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

## 🛠️ 開発

```bash
# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build

# 開発モードで実行
npm run dev
```

[開発ガイドを見る →](docs/DEVELOPMENT.ja.md)

## 📄 ライセンス

GPL-3.0

## ⭐ スター履歴

<a href="https://star-history.dera.page/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>

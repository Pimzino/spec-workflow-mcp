# 設定ガイド

このガイドは、Spec Workflow MCPのすべての設定オプションをカバーしています。

## コマンドラインオプション

### 基本的な使用方法

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [options]
```

### 利用可能なオプション

| オプション | 説明 | 例 |
|--------|-------------|---------|
| `--help` | 包括的な使用情報を表示 | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | ダッシュボード専用モードで実行（デフォルトポート：5000） | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <number>` | カスタムダッシュボードポートを指定（1024-65535） | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### 重要な注意事項

- **単一のダッシュボードインスタンス**：ダッシュボードは一度に1つだけ実行されます。すべてのMCPサーバーが同じダッシュボードに接続します。
- **デフォルトポート**：ダッシュボードはデフォルトでポート5000を使用します。5000が使用できない場合のみ`--port`を使用してください。
- **別途ダッシュボード**：常にMCPサーバーとは別にダッシュボードを実行してください。

## 使用例

### 典型的なワークフロー

1. **ダッシュボードを起動する**（最初に一度だけ実行）：
```bash
# デフォルトポート5000を使用
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **MCPサーバーを起動する**（プロジェクトごとに1つ、別々のターミナルで）：
```bash
# プロジェクト1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# プロジェクト2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# プロジェクト3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

すべてのプロジェクトが http://localhost:5000 のダッシュボードに表示されます

### カスタムポートのダッシュボード

ポート5000が使用できない場合のみカスタムポートを使用してください：

```bash
# ポート8080でダッシュボードを起動
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## 環境変数

### SPEC_WORKFLOW_HOME

デフォルトのグローバル状態ディレクトリ（`~/.spec-workflow-mcp`）をオーバーライドします。これは`$HOME`が読み取り専用のサンドボックス環境で役立ちます。

| 変数 | デフォルト | 説明 |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | グローバル状態ファイル用のディレクトリ |

**このディレクトリに保存されるファイル：**
- `activeProjects.json` - プロジェクトレジストリ
- `activeSession.json` - ダッシュボードセッション情報
- `settings.json` - グローバル設定
- `job-execution-history.json` - ジョブ実行履歴
- `migration.log` - 実装ログ移行追跡

**使用例：**

```bash
# 絶対パス
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# 相対パス（現在の作業ディレクトリに対して解決されます）
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# ダッシュボードモード用
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**サンドボックス環境（例：Codex CLI）：**

Codex CLIの`sandbox_mode=workspace-write`などのサンドボックス環境で実行する場合は、`SPEC_WORKFLOW_HOME`をワークスペース内の書き込み可能な場所に設定します：

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## ダッシュボードセッション管理

ダッシュボードは`~/.spec-workflow-mcp/activeSession.json`（または設定されている場合は`$SPEC_WORKFLOW_HOME/activeSession.json`）にセッション情報を保存します。このファイルは：
- 単一のダッシュボードインスタンスを強制
- MCPサーバーが実行中のダッシュボードを発見できるようにする
- ダッシュボードが停止すると自動的にクリーンアップされる

### 単一インスタンスの強制

一度に1つのダッシュボードのみを実行できます。2つ目のダッシュボードを起動しようとすると：

```
Dashboard is already running at: http://localhost:5000

You can:
  1. Use the existing dashboard at: http://localhost:5000
  2. Stop it first (Ctrl+C or kill PID), then start a new one

Note: Only one dashboard instance is needed for all your projects.
```

## ポート管理

**デフォルトポート**：5000
**カスタムポート**：ポート5000が使用できない場合のみ`--port <number>`を使用

### ポートの競合

ポート5000が別のサービスで既に使用されている場合：

```bash
Failed to start dashboard: Port 5000 is already in use.

This might be another service using port 5000.
To use a different port:
  spec-workflow-mcp --dashboard --port 8080
```

## 設定ファイル（非推奨）

### デフォルトの場所

サーバーは次の場所で設定を検索します：`<project-dir>/.spec-workflow/config.toml`

### ファイル形式

設定はTOML形式を使用します。完全な例を以下に示します：

```toml
# プロジェクトディレクトリ（デフォルトは現在のディレクトリ）
projectDir = "/path/to/your/project"

# ダッシュボードポート（1024-65535）
port = 3456

# ダッシュボード専用モードで実行
dashboardOnly = false

# インターフェース言語
# オプション：en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "en"

# サウンド通知（VSCode拡張機能のみ）
[notifications]
enabled = true
volume = 0.5

# 詳細設定
[advanced]
# WebSocket再接続試行回数
maxReconnectAttempts = 10

# ファイルウォッチャー設定
[watcher]
enabled = true
debounceMs = 300
```

### 設定オプション

#### 基本設定

| オプション | タイプ | デフォルト | 説明 |
|--------|------|---------|-------------|
| `projectDir` | string | 現在のディレクトリ | プロジェクトディレクトリパス |
| `port` | number | エフェメラル | ダッシュボードポート（1024-65535） |
| `dashboardOnly` | boolean | false | MCPサーバーなしでダッシュボードを実行 |
| `lang` | string | "en" | インターフェース言語 |

> **注意**：`autoStartDashboard`オプションはv2.0.0で削除されました。ダッシュボードは`--dashboard`フラグでアクセスできる統合マルチプロジェクトモードを使用するようになりました。

#### 言語オプション

- `en` - English
- `ja` - Japanese（日本語）
- `zh` - Chinese（中文）
- `es` - Spanish（Español）
- `pt` - Portuguese（Português）
- `de` - German（Deutsch）
- `fr` - French（Français）
- `ru` - Russian（Русский）
- `it` - Italian（Italiano）
- `ko` - Korean（한국어）
- `ar` - Arabic（العربية）

### カスタム設定の作成

1. 例の設定をコピーします：
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. 設定を編集します：
```toml
# 私のプロジェクト設定
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "en"
```

3. 設定を使用します：
```bash
# 自動的に.spec-workflow/config.tomlを使用
npx -y @pimzino/spec-workflow-mcp@latest

# または明示的に指定
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## 設定の優先順位

設定値は次の順序で適用されます（優先順位の高い順）：

1. **コマンドライン引数** - 常に優先される
2. **カスタム設定ファイル** - `--config`で指定
3. **デフォルト設定ファイル** - `.spec-workflow/config.toml`
4. **組み込みデフォルト** - フォールバック値

### 優先順位の例

```toml
# config.toml
port = 3000
```

```bash
# コマンドライン引数が設定ファイルをオーバーライド
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# 結果：port = 4000（CLIが優先）
```

## 環境固有の設定

### 開発設定

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "en"

[advanced]
debugMode = true
verboseLogging = true
```

使用方法：
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### 本番設定

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "en"

[advanced]
debugMode = false
verboseLogging = false
```

使用方法：
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## ポート設定

### 有効なポート範囲

ポートは1024から65535の間である必要があります。

### エフェメラルポート

ポートが指定されていない場合、システムは自動的に利用可能なエフェメラルポートを選択します。これは以下の場合に推奨されます：
- 開発環境
- 複数の同時プロジェクト
- ポート競合の回避

### 固定ポート

以下が必要な場合は固定ポートを使用してください：
- ブックマークのための一貫したURL
- 他のツールとの統合
- 共有設定を使用したチームコラボレーション

### ポート競合の解決

ポートが既に使用されている場合：

1. **ポートを使用しているものを確認：**
   - Windows：`netstat -an | findstr :3000`
   - macOS/Linux：`lsof -i :3000`

2. **解決策：**
   - 別のポートを使用：`--port 3001`
   - ポートを使用しているプロセスを終了
   - `--port`を省略してエフェメラルポートを使用

## マルチプロジェクトセットアップ

### 個別の設定

プロジェクト固有の設定を作成します：

```bash
# プロジェクトA
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# プロジェクトB
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### 共有設定

オーバーライドを含む共有設定を使用します：

```bash
# 共有ベース設定
~/configs/spec-workflow-base.toml

# プロジェクト固有のオーバーライド
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## VSCode拡張機能の設定

VSCode拡張機能には独自の設定があります：

1. VSCode設定を開く（Cmd/Ctrl + ,）
2. 「Spec Workflow」を検索
3. 設定：
   - 言語設定
   - サウンド通知
   - アーカイブの表示
   - 自動更新間隔

## 設定のトラブルシューティング

### 設定が読み込まれない

1. **ファイルの場所を確認：**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **TOML構文を検証：**
   ```bash
   # TOML CLIツールをインストール
   npm install -g @iarna/toml

   # 検証
   toml .spec-workflow/config.toml
   ```

3. **権限を確認：**
   ```bash
   # ファイルが読み取り可能であることを確認
   chmod 644 .spec-workflow/config.toml
   ```

### 一般的な問題

| 問題 | 解決策 |
|-------|----------|
| ポートが既に使用中 | 別のポートを使用するか、エフェメラルポートを省略 |
| 設定ファイルが見つからない | パスを確認し、必要に応じて絶対パスを使用 |
| 無効なTOML構文 | TOMLリンターで検証 |
| 設定が適用されない | 設定の優先順位を確認 |

## ベストプラクティス

1. 設定ファイルに**バージョン管理を使用**
2. プロジェクトREADMEに**カスタム設定を文書化**
3. 開発では**エフェメラルポートを使用**
4. 設定ファイルに**機密データを含めない**
5. **環境固有**の設定を作成
6. デプロイ前に**設定変更をテスト**

## 関連ドキュメント

- [ユーザーガイド](USER-GUIDE.ja.md) - 設定されたサーバーの使用
- [インターフェースガイド](INTERFACES.ja.md) - ダッシュボードと拡張機能の設定
- [トラブルシューティング](TROUBLESHOOTING.ja.md) - 一般的な設定問題

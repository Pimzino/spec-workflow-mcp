# トラブルシューティングガイド

Spec Workflow MCPに関する一般的な問題を解決するためのガイドです。

## クイック診断

### インストールの確認
```bash
# npmパッケージがアクセス可能か確認
npx -y @pimzino/spec-workflow-mcp@latest --help

# 正しいディレクトリで実行しているか確認
pwd  # Windowsでは 'cd'

# .spec-workflowディレクトリが存在するか確認
ls -la .spec-workflow  # Windowsでは 'dir .spec-workflow'
```

### サービスの確認
```bash
# MCPサーバーのテスト
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# ダッシュボードのテスト
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# ポートの可用性を確認
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## 一般的な問題と解決策

## インストールの問題

### NPMパッケージが見つからない

**エラー**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**解決策**:
1. インターネット接続を確認
2. npmキャッシュをクリア:
   ```bash
   npm cache clean --force
   ```
3. バージョンタグなしで試す:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. 最初にグローバルインストール:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### 権限が拒否される

**エラー**: `EACCES: permission denied`

**解決策**:
1. **macOS/Linux**: 適切なnpm権限を使用:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: 管理者として実行するか、npm権限を修正:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. -yフラグ付きでnpxを使用:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## MCPサーバーの問題

### サーバーが起動しない

**エラー**: `Failed to start MCP server`

**解決策**:
1. Node.jsのバージョンを確認:
   ```bash
   node --version  # 18.0以上である必要がある
   ```
2. プロジェクトパスが存在するか確認:
   ```bash
   ls -la /path/to/project
   ```
3. 競合するプロセスを確認:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. 絶対パスで試す:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCPがAIツールに接続できない

**エラー**: `MCP server unreachable` または `Connection refused`

**解決策**:

1. **Claude Desktop**: 設定ファイルを確認:
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

2. **Claude Code CLI**: セットアップを確認:
   ```bash
   claude mcp list  # spec-workflowがリストされているか確認
   claude mcp remove spec-workflow  # 存在する場合は削除
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **パスの問題**: パスが絶対パスで存在することを確認:
   - ❌ `~/project` または `./project`
   - ✅ `/Users/name/project` または `C:\Users\name\project`

### ツールが利用できない

**エラー**: `Tool 'spec-workflow' not found`

**解決策**:
1. AIツールを完全に再起動
2. MCPサーバーが実行されているか確認（プロセスを探す）
3. 設定が正しく保存されているか確認
4. ツールを明示的に言及してみる: "spec-workflowを使用して仕様を作成して"

## ダッシュボードの問題

### ダッシュボードが読み込まれない

**エラー**: `Cannot connect to dashboard` または空白ページ

**解決策**:
1. ダッシュボードが起動されているか確認:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. ブラウザでURLを確認（ポートに注意）:
   ```
   http://localhost:3000  # または表示されているポート
   ```
3. 別のブラウザまたはシークレットモードで試す
4. ブラウザコンソールでエラーを確認（F12 → Console）
5. 一時的にブラウザ拡張機能を無効化

### ポートが既に使用中

**エラー**: `Error: listen EADDRINUSE: address already in use :::3000`

**解決策**:
1. 別のポートを使用:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. ポートを使用しているプロセスを見つけて終了:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. エフェメラルポートを使用（--portフラグを省略）:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### WebSocket接続が失敗する

**エラー**: `WebSocket connection lost` またはリアルタイム更新が機能しない

**解決策**:
1. ブラウザページをリフレッシュ
2. ファイアウォールがWebSocketをブロックしていないか確認
3. ダッシュボードとMCPサーバーが同じプロジェクトから実行されているか確認
4. ブラウザコンソールで特定のエラーを確認
5. 別のネットワークで試す（企業ネットワークの場合）

### ダッシュボードが更新されない

**症状**: 変更がリアルタイムで反映されない

**解決策**:
1. ブラウザをハードリフレッシュ（Ctrl+Shift+RまたはCmd+Shift+R）
2. ブラウザキャッシュをクリア
3. WebSocket接続ステータスを確認（緑色で表示されるべき）
4. ファイルシステムウォッチャーが動作しているか確認:
   ```bash
   # プロジェクトにテストファイルを作成
   touch .spec-workflow/test.md
   # ダッシュボードで更新がトリガーされるはず
   ```

## 承認システムの問題

### 承認が表示されない

**エラー**: ダッシュボードに承認通知がない

**解決策**:
1. ダッシュボードがMCPサーバーと一緒に実行されていることを確認:
   ```bash
   # 自動起動を使用
   npx -y @pimzino/spec-workflow-mcp@latest /path --AutoStartDashboard

   # または両方を別々に実行
   # ターミナル1:
   npx -y @pimzino/spec-workflow-mcp@latest /path
   # ターミナル2:
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. 承認ディレクトリが存在するか確認:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. AI経由で承認リクエストを手動でトリガー

### ドキュメントを承認できない

**エラー**: 承認ボタンが機能しない

**解決策**:
1. ブラウザコンソールでJavaScriptエラーを確認
2. 正しい仕様ページにいるか確認
3. ドキュメントが承認保留ステータスになっているか確認
4. VSCode拡張機能を使用してみる（利用可能な場合）

## ファイルシステムの問題

### 仕様ファイルが作成されない

**エラー**: 仕様ドキュメントがファイルシステムに表示されない

**解決策**:
1. 書き込み権限を確認:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. 正しい作業ディレクトリか確認:
   ```bash
   pwd  # プロジェクトルートであるべき
   ```
3. 隠しファイルを確認:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. アンチウイルスがファイル作成をブロックしていないか確認

### ファイルの権限が拒否される

**エラー**: 仕様作成時に`EACCES`または`Permission denied`

**解決策**:
1. ディレクトリの権限を修正:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. ファイルの所有権を確認:
   ```bash
   ls -la .spec-workflow
   # 自分のユーザーが所有しているべき
   ```
3. 所有するディレクトリから実行（システムディレクトリではない）

## VSCode拡張機能の問題

### 拡張機能が読み込まれない

**エラー**: アクティビティバーにSpec Workflowアイコンが表示されない

**解決策**:
1. 拡張機能がインストールされているか確認:
   - 拡張機能を開く（Ctrl+Shift+X）
   - "Spec Workflow MCP"を検索
   - インストールされて有効になっているか確認
2. VSCodeウィンドウをリロード:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. 拡張機能の出力を確認:
   - View → Output → ドロップダウンから"Spec Workflow"を選択
4. プロジェクトに`.spec-workflow`ディレクトリがあることを確認

### 拡張機能のコマンドが機能しない

**エラー**: コマンドが失敗またはエラーを表示

**解決策**:
1. `.spec-workflow`を含むプロジェクトフォルダを開く
2. VSCodeが正しいワークスペースを使用しているか確認
3. 特定のエラーについて拡張機能ログを確認
4. 拡張機能を再インストールしてみる:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## 設定の問題

### 設定ファイルが読み込まれない

**エラー**: config.tomlの設定が適用されない

**解決策**:
1. TOML構文を確認:
   ```bash
   # TOMLバリデーターをインストール
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. ファイルの場所を確認:
   - デフォルト: `.spec-workflow/config.toml`
   - カスタム: `--config`フラグを使用
3. 構文エラーがないことを確認:
   ```toml
   # 正しい
   port = 3000
   lang = "en"

   # 間違い
   port: 3000  # =を使用すべき、:ではない
   lang = en   # 引用符が必要
   ```

### コマンドライン引数が機能しない

**エラー**: `--port`などのフラグが無視される

**解決策**:
1. 引数の順序を確認:
   ```bash
   # 正しい
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # 間違い
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. フラグの値が有効であることを確認:
   - ポート: 1024-65535
   - 言語: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. `--help`を使用してすべてのオプションを確認

## パフォーマンスの問題

### 応答時間が遅い

**症状**: ダッシュボードまたはツールの応答が遅い

**解決策**:
1. システムリソースを確認:
   ```bash
   # CPUとメモリ使用率
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. 大規模プロジェクトでファイルウォッチャーを減らす:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. 古い承認レコードをクリア:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. すべてをリストする代わりに特定の仕様名を使用

### メモリ使用量が多い

**解決策**:
1. サービスを定期的に再起動
2. ダッシュボードのリフレッシュレートを制限:
   ```json
   // VSCode設定
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. 完了した仕様をアーカイブ
4. ダッシュボードのブラウザキャッシュをクリア

## ネットワークの問題

### 企業プロキシの背後

**解決策**:
1. npmプロキシを設定:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. ローカルインストールを使用:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### ファイアウォールが接続をブロック

**解決策**:
1. ファイアウォールでNode.jsを許可
2. 0.0.0.0の代わりにlocalhostを使用
3. 特定のポートルールを設定
4. 別のポート範囲を試す

## プラットフォーム固有の問題

### Windows

#### パス形式の問題
**エラー**: `Invalid path`またはパスが見つからない

**解決策**:
```bash
# スラッシュを使用
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# またはエスケープされたバックスラッシュ
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### PowerShell実行ポリシー
**エラー**: `cannot be loaded because running scripts is disabled`

**解決策**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeperのブロック
**エラー**: `cannot be opened because the developer cannot be verified`

**解決策**:
1. システム環境設定 → セキュリティとプライバシー → 許可
2. または検疫を削除:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### 依存関係の不足
**エラー**: `shared library not found`

**解決策**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## サポートを受ける

### 診断情報

問題を報告する際に含めるもの:

1. **システム情報**:
   ```bash
   node --version
   npm --version
   uname -a  # Windowsでは 'ver'
   ```

2. **エラーメッセージ**:
   - 完全なエラーテキスト
   - ビジュアル問題の場合はスクリーンショット
   - ブラウザコンソールログ

3. **設定**:
   - MCPクライアント設定
   - config.tomlの内容
   - 使用したコマンドライン

4. **再現手順**:
   - 実行した正確なコマンド
   - 期待される動作
   - 実際の動作

### サポートチャンネル

1. **GitHub Issues**: [イシューを作成](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **ドキュメント**: `/docs`内の他のガイドを確認
3. **コミュニティ**: ディスカッションとQ&A

### デバッグモード

詳細ログを有効化:

```bash
# 環境変数を設定
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# デバッグ出力で実行
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## 予防のヒント

### ベストプラクティス

1. **設定では常に絶対パスを使用**
2. **Node.jsを最新に保つ**（v18+必須）
3. **プロジェクトルートディレクトリから実行**
4. **`--help`を使用してオプションを確認**
5. **問題発生時はクリーンな環境でテスト**
6. **失敗と判断する前にログを確認**
7. **`.spec-workflow`ディレクトリを定期的にバックアップ**

### 定期メンテナンス

1. 月次で古い承認をクリア
2. 完了した仕様をアーカイブ
3. npmパッケージを定期的に更新
4. ログのディスクスペースを監視
5. 更新後にサービスを再起動

## 関連ドキュメント

- [設定ガイド](CONFIGURATION.md) - 詳細な設定オプション
- [ユーザーガイド](USER-GUIDE.md) - 一般的な使用方法
- [開発ガイド](DEVELOPMENT.md) - 修正への貢献
- [インターフェースガイド](INTERFACES.md) - ダッシュボードと拡張機能の詳細

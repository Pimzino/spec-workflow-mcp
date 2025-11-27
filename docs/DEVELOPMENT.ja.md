# 開発ガイド

このガイドでは、開発環境のセットアップ、プロジェクトのビルド、コードへの貢献、およびSpec Workflow MCPのアーキテクチャの理解について説明します。

## 前提条件

### 必要なソフトウェア

- **Node.js** 18.0以上
- **npm** 9.0以上
- **Git** バージョン管理用
- **TypeScript**の知識があると便利

### 推奨ツール

- **VSCode** TypeScript拡張機能付き
- **Chrome/Edge DevTools** ダッシュボードのデバッグ用
- **Postman/Insomnia** APIテスト用

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. 依存関係のインストール

```bash
npm install
```

これにより以下がインストールされます：
- MCP SDK
- TypeScriptとビルドツール
- ダッシュボードサーバー用Express
- WebSocketライブラリ
- テストフレームワーク

### 3. プロジェクトのビルド

```bash
npm run build
```

これによりTypeScriptファイルが`dist/`ディレクトリ内のJavaScriptにコンパイルされます。

## 開発コマンド

### コアコマンド

| コマンド | 説明 |
|---------|-------------|
| `npm run dev` | 自動リロード付きで開発モードで起動 |
| `npm run build` | 本番バンドルをビルド |
| `npm start` | 本番サーバーを実行 |
| `npm test` | テストスイートを実行 |
| `npm run clean` | ビルド成果物を削除 |
| `npm run lint` | コードリンターを実行 |
| `npm run format` | Prettierでコードをフォーマット |

### 開発モード

```bash
npm run dev
```

機能：
- ファイル変更時の自動再コンパイル
- ダッシュボードのホットリロード
- 詳細なエラーメッセージ
- デバッグ用のソースマップ

### 本番用ビルド

```bash
npm run clean && npm run build
```

最適化：
- 最小化されたJavaScript
- 最適化されたバンドルサイズ
- 本番エラーハンドリング
- パフォーマンスの改善

## プロジェクト構造

```
spec-workflow-mcp/
├── src/                    # ソースコード
│   ├── index.ts           # MCPサーバーエントリーポイント
│   ├── server.ts          # ダッシュボードサーバー
│   ├── tools/             # MCPツール実装
│   ├── prompts/           # プロンプトテンプレート
│   ├── utils/             # ユーティリティ関数
│   └── types/             # TypeScript型定義
├── dist/                   # コンパイルされたJavaScript
├── dashboard/             # Webダッシュボードファイル
│   ├── index.html         # ダッシュボードUI
│   ├── styles.css         # ダッシュボードスタイル
│   └── script.js          # ダッシュボードJavaScript
├── vscode-extension/      # VSCode拡張機能
│   ├── src/               # 拡張機能ソース
│   └── package.json       # 拡張機能マニフェスト
├── tests/                 # テストファイル
├── docs/                  # ドキュメント
└── package.json           # プロジェクト設定
```

## アーキテクチャ概要

### MCPサーバーアーキテクチャ

```
クライアント（AI）↔ MCPプロトコル ↔ サーバー ↔ ファイルシステム
                              ↓
                          ダッシュボード
```

### 主要コンポーネント

#### 1. MCPサーバー（`src/index.ts`）
- MCPプロトコル通信を処理
- ツールリクエストを処理
- プロジェクト状態を管理
- ファイルシステム操作

#### 2. ダッシュボードサーバー（`src/server.ts`）
- Webダッシュボードを提供
- WebSocket接続
- リアルタイム更新
- HTTP APIエンドポイント

#### 3. ツール（`src/tools/`）
各ツールは個別のモジュールです：
- 入力検証
- ビジネスロジック
- ファイル操作
- レスポンスのフォーマット

#### 4. プロンプト（`src/prompts/`）
以下のためのテンプレート文字列：
- ドキュメント生成
- ワークフローガイダンス
- エラーメッセージ
- ユーザー指示

## 新機能の実装

### 新しいツールの追加

1. **`src/tools/`にツールファイルを作成**：

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'ツールの動作説明',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'パラメータの説明' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // ツールの実装
    const { param1, param2 = 0 } = params;

    // ビジネスロジックをここに

    return {
      success: true,
      data: 'ツールのレスポンス'
    };
  }
};
```

2. **インデックスに登録**（`src/tools/index.ts`）：

```typescript
export { myNewTool } from './my-new-tool';
```

3. **サーバーに追加**（`src/index.ts`）：

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### ダッシュボード機能の追加

1. **HTMLを更新**（`dashboard/index.html`）：

```html
<div class="new-feature">
  <h3>新機能</h3>
  <button id="new-action">アクション</button>
</div>
```

2. **JavaScriptを追加**（`dashboard/script.js`）：

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // 機能ロジック
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **サーバーで処理**（`src/server.ts`）：

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // 新しいアクションを処理
  }
});
```

## テスト

### テストの実行

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test -- src/tools/my-tool.test.ts

# カバレッジ付きで実行
npm run test:coverage

# ウォッチモード
npm run test:watch
```

### テストの作成

ソースファイルの隣にテストファイルを作成します：

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('入力を正しく処理する', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('エラーを処理する', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 統合テスト

完全なワークフローをテストします：

```typescript
// tests/integration/workflow.test.ts
describe('完全なワークフロー', () => {
  it('最初から最後まで仕様を作成する', async () => {
    // 要件を作成
    // 要件を承認
    // 設計を作成
    // 設計を承認
    // タスクを作成
    // 構造を検証
  });
});
```

## デバッグ

### MCPサーバーのデバッグ

1. **デバッグ出力を追加**：

```typescript
console.error('[DEBUG]', 'ツールが呼び出されました:', toolName, params);
```

2. **VSCodeデバッガーを使用**：

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

### ダッシュボードのデバッグ

1. **ブラウザDevTools**：
   - ブラウザでダッシュボードを開く
   - F12を押してDevToolsを開く
   - エラーのコンソールを確認
   - WebSocketのネットワークタブを監視

2. **ロギングを追加**：

```javascript
console.log('WebSocketメッセージ:', message);
console.log('状態更新:', newState);
```

## コードスタイルと規格

### TypeScriptガイドライン

- strictモードを使用
- データ構造のインターフェースを定義
- `any`型を避ける
- コールバックよりasync/awaitを使用

### ファイル構成

- ファイルごとに1つのコンポーネント
- 関連する機能をグループ化
- 明確な命名規則
- 包括的なコメント

### 命名規則

- **ファイル**：kebab-case（`my-tool.ts`）
- **クラス**：PascalCase（`SpecManager`）
- **関数**：camelCase（`createSpec`）
- **定数**：UPPER_SNAKE（`MAX_RETRIES`）

## 貢献

### 貢献プロセス

1. **リポジトリをフォーク**
2. **機能ブランチを作成**：
   ```bash
   git checkout -b feature/my-feature
   ```
3. **変更を加える**
4. **テストを書く**
5. **テストとリントを実行**：
   ```bash
   npm test
   npm run lint
   ```
6. **変更をコミット**：
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **ブランチをプッシュ**：
   ```bash
   git push origin feature/my-feature
   ```
8. **プルリクエストを作成**

### コミットメッセージ形式

従来のコミットに従います：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` フォーマット
- `refactor:` コード再構築
- `test:` テスト
- `chore:` メンテナンス

例：
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### プルリクエストガイドライン

- 明確な説明
- 関連する問題を参照
- UI変更のスクリーンショットを含める
- すべてのテストが合格することを確認
- ドキュメントを更新

## 公開

### NPMパッケージ

1. **バージョンを更新**：
   ```bash
   npm version patch|minor|major
   ```

2. **パッケージをビルド**：
   ```bash
   npm run build
   ```

3. **公開**：
   ```bash
   npm publish
   ```

### VSCode拡張機能

1. **拡張機能のバージョンを更新**（`vscode-extension/package.json`）

2. **拡張機能をビルド**：
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **マーケットプレイスに公開**：
   ```bash
   vsce publish
   ```

## パフォーマンス最適化

### サーバーパフォーマンス

- ファイル読み取りにキャッシングを使用
- ファイルウォッチャーにデバウンスを実装
- WebSocketメッセージのバッチ処理を最適化
- 大きなドキュメントの遅延読み込み

### ダッシュボードパフォーマンス

- DOM更新を最小化
- 長いリストに仮想スクロールを使用
- プログレッシブレンダリングを実装
- WebSocket再接続を最適化

## セキュリティの考慮事項

### 入力検証

常にツール入力を検証します：

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Invalid spec name');
}

// ファイルパスをサニタイズ
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Invalid path');
}
```

### ファイルシステムセキュリティ

- プロジェクトディレクトリへの操作を制限
- すべてのファイルパスを検証
- 安全なファイル操作を使用
- 権限チェックを実装

## 開発問題のトラブルシューティング

### 一般的なビルドエラー

| エラー | 解決策 |
|-------|----------|
| TypeScriptエラー | `npm run build`を実行して詳細なエラーを確認 |
| モジュールが見つからない | インポートを確認し、`npm install`を実行 |
| ポートが既に使用中 | ポートを変更するか既存のプロセスを終了 |
| WebSocket接続失敗 | サーバーが実行中でポートが正しいか確認 |

### 開発のヒント

1. より良い型安全性のために**TypeScript strictモードを使用**
2. デバッグを容易にするために**ソースマップを有効化**
3. 開発中の自動再起動に**nodemonを使用**
4. 分離されたディレクトリで**ファイル操作をテスト**
5. Chrome DevToolsで**パフォーマンスを監視**

## リソース

- [MCP SDKドキュメント](https://github.com/anthropics/mcp-sdk)
- [TypeScriptハンドブック](https://www.typescriptlang.org/docs/)
- [Node.jsベストプラクティス](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode拡張機能API](https://code.visualstudio.com/api)

## 関連ドキュメント

- [設定ガイド](CONFIGURATION.ja.md) - サーバー設定
- [ユーザーガイド](USER-GUIDE.ja.md) - サーバーの使用
- [ツールリファレンス](TOOLS-REFERENCE.ja.md) - ツールドキュメント
- [トラブルシューティング](TROUBLESHOOTING.ja.md) - 一般的な問題

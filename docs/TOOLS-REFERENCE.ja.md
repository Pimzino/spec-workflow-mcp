# ツールリファレンス

Spec Workflow MCPが提供するすべてのMCPツールの完全なドキュメント。

## 概要

Spec Workflow MCPは、構造化されたソフトウェア開発のための専門的なツールを提供します。これらのツールは、Model Context Protocolを通じてAIアシスタントからアクセスできます。

## ツールカテゴリ

1. **ワークフローガイド** - ドキュメントとガイダンス
2. **仕様管理** - 仕様の作成と管理
3. **コンテキストツール** - プロジェクト情報の取得
4. **ステアリングツール** - プロジェクトレベルのガイダンス
5. **承認ツール** - ドキュメント承認ワークフロー

## ワークフローガイドツール

### spec-workflow-guide

**目的**: 仕様駆動ワークフロープロセスの包括的なガイダンスを提供します。

**パラメータ**: なし

**戻り値**: 完全なワークフローを説明するMarkdownガイド

**使用例**:
```
"仕様ワークフローガイドを表示して"
```

**レスポンスに含まれる内容**:
- ワークフロー概要
- ステップバイステップのプロセス
- ベストプラクティス
- プロンプトの例

### steering-guide

**目的**: プロジェクトステアリングドキュメント作成のガイド。

**パラメータ**: なし

**戻り値**: ステアリングドキュメント作成のMarkdownガイド

**使用例**:
```
"ステアリングドキュメントの作成方法を表示して"
```

**レスポンスに含まれる内容**:
- ステアリングドキュメントのタイプ
- 作成プロセス
- コンテンツガイドライン
- 例

## 仕様管理ツール

### create-spec-doc

**目的**: 仕様ドキュメント（要件、設計、タスク）を作成または更新します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前（ケバブケース） |
| docType | string | はい | タイプ: "requirements"、"design"、または"tasks" |
| content | string | はい | ドキュメントのMarkdownコンテンツ |
| revision | boolean | いいえ | 改訂版かどうか（デフォルト: false） |

**使用例**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# User Authentication Requirements\n\n## Overview\n...",
  revision: false
}
```

**戻り値**:
```typescript
{
  success: true,
  message: "Requirements document created successfully",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**注意**:
- 存在しない場合は仕様ディレクトリを作成
- 新しいドキュメントの承認を自動的にリクエスト
- Markdown形式を検証
- 新しいタイプを作成する際に既存のドキュメントを保持

### spec-list

**目的**: すべての仕様を現在のステータスとともにリストします。

**パラメータ**: なし

**戻り値**: 仕様サマリーの配列

**レスポンス構造**:
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

**使用例**:
```
"すべての仕様をリストして"
```

### spec-status

**目的**: 特定の仕様の詳細なステータス情報を取得します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 確認する仕様の名前 |

**戻り値**: 詳細な仕様ステータス

**レスポンス構造**:
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

**使用例**:
```
"user-authentication仕様のステータスを表示して"
```

### manage-tasks

**目的**: 更新、ステータス変更、進捗追跡を含む包括的なタスク管理。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前 |
| action | string | はい | アクション: "update"、"complete"、"list"、"progress" |
| taskId | string | 場合による | タスクID（update/completeに必須） |
| status | string | いいえ | 新しいステータス: "pending"、"in-progress"、"completed" |
| notes | string | いいえ | タスクの追加メモ |

**アクション**:

1. **タスクステータスの更新**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Started implementation"
}
```

2. **タスクの完了**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **タスクのリスト**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **進捗の取得**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**戻り値**: タスク情報または更新確認

## コンテキストツール

### get-template-context

**目的**: すべてのドキュメントタイプのMarkdownテンプレートを取得します。

**パラメータ**: なし

**戻り値**: すべてのテンプレートを含むオブジェクト

**レスポンス構造**:
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

**使用例**:
```
"すべてのドキュメントテンプレートを取得して"
```

### get-steering-context

**目的**: プロジェクトステアリングドキュメントとガイダンスを取得します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| docType | string | いいえ | 特定のドキュメント: "product"、"tech"、"structure"、または"all" |

**戻り値**: ステアリングドキュメントのコンテンツ

**使用例**:
```typescript
{
  docType: "tech"  // テクニカルステアリングのみを返す
}
```

**レスポンス構造**:
```typescript
{
  product: "# Product Steering\n\n## Vision\n...",
  tech: "# Technical Steering\n\n## Architecture\n...",
  structure: "# Structure Steering\n\n## Organization\n..."
}
```

### get-spec-context

**目的**: 特定の仕様の完全なコンテキストを取得します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前 |
| includeContent | boolean | いいえ | ドキュメントコンテンツを含める（デフォルト: true） |

**戻り値**: 完全な仕様コンテキスト

**レスポンス構造**:
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

**使用例**:
```
"user-authentication仕様の完全なコンテキストを取得して"
```

## ステアリングドキュメントツール

### create-steering-doc

**目的**: プロジェクトステアリングドキュメント（product、tech、structure）を作成します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| docType | string | はい | タイプ: "product"、"tech"、または"structure" |
| content | string | はい | ドキュメントのMarkdownコンテンツ |

**使用例**:
```typescript
{
  docType: "product",
  content: "# Product Steering\n\n## Vision\nBuild the best..."
}
```

**戻り値**:
```typescript
{
  success: true,
  message: "Product steering document created",
  path: ".spec-workflow/steering/product.md"
}
```

**注意**:
- 必要に応じてステアリングディレクトリを作成
- 既存のステアリングドキュメントを上書き
- ステアリングドキュメントには承認不要
- 仕様の前に作成する必要がある

## 承認システムツール

### request-approval

**目的**: ドキュメントのユーザー承認をリクエストします。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前 |
| docType | string | はい | 承認するドキュメントタイプ |
| documentId | string | はい | 追跡用の一意のID |
| content | string | はい | レビュー用のドキュメントコンテンツ |

**使用例**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requirements\n\n..."
}
```

**戻り値**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approval requested. Check dashboard to review."
}
```

### get-approval-status

**目的**: ドキュメントの承認ステータスを確認します。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前 |
| documentId | string | はい | 確認するドキュメントID |

**戻り値**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Please add more detail about error handling",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**使用例**:
```
"user-auth要件の承認ステータスを確認して"
```

### delete-approval

**目的**: 完了した承認リクエストを削除して承認キューをクリーンアップします。

**パラメータ**:

| パラメータ | タイプ | 必須 | 説明 |
|-----------|------|----------|-------------|
| specName | string | はい | 仕様の名前 |
| documentId | string | はい | 削除するドキュメントID |

**戻り値**:
```typescript
{
  success: true,
  message: "Approval record deleted"
}
```

**使用例**:
```
"user-authの完了した承認をクリーンアップして"
```

## ツール統合パターン

### 順次ワークフロー

ツールは順番に動作するように設計されています:

1. `steering-guide` → ステアリングについて学ぶ
2. `create-steering-doc` → ステアリングドキュメントを作成
3. `spec-workflow-guide` → ワークフローを学ぶ
4. `create-spec-doc` → 要件を作成
5. `request-approval` → レビューをリクエスト
6. `get-approval-status` → ステータスを確認
7. `create-spec-doc` → 設計を作成（承認後）
8. `manage-tasks` → 実装を追跡

### 並行操作

一部のツールは同時に使用できます:

- `spec-list` + `spec-status` → 概要と詳細を取得
- `get-spec-context` + `get-steering-context` → 完全なプロジェクトコンテキスト
- 複数の`create-spec-doc` → 複数の仕様を作成

### エラー処理

すべてのツールは一貫したエラー構造を返します:

```typescript
{
  success: false,
  error: "Spec not found",
  details: "No spec named 'invalid-spec' exists",
  suggestion: "Use spec-list to see available specs"
}
```

## ベストプラクティス

### ツールの選択

1. **情報収集**:
   - 概要には`spec-list`を使用
   - 特定の仕様には`spec-status`を使用
   - 実装には`get-spec-context`を使用

2. **ドキュメント作成**:
   - 常に要件を最初に作成
   - 設計の前に承認を待つ
   - 設計承認後にタスクを作成

3. **タスク管理**:
   - タスク開始時にステータスを更新
   - 完了後すぐに完了マークを付ける
   - 重要なコンテキストにはメモを使用

### パフォーマンスの考慮事項

- **バッチ操作**: 1つの会話で複数の仕様をリクエスト
- **キャッシング**: ツールはパフォーマンス向上のためにファイル読み取りをキャッシュ
- **選択的読み込み**: より高速なステータスチェックには`includeContent: false`を使用

### セキュリティ

- **パス検証**: すべてのパスが検証され、サニタイズされる
- **プロジェクト分離**: ツールはプロジェクトディレクトリのみにアクセス
- **入力サニタイゼーション**: Markdownコンテンツがサニタイズされる
- **実行なし**: ツールはコードを実行しない

## ツールの拡張

### カスタムツール開発

新しいツールを追加するには:

1. `src/tools/`にツールモジュールを作成
2. パラメータスキーマを定義
3. ハンドラー関数を実装
4. MCPサーバーに登録
5. エクスポートに追加

構造の例:
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

## ツールのバージョニング

ツールは後方互換性を維持します:

- パラメータの追加はオプション
- レスポンス構造は拡張、置換ではない
- 非推奨の機能は警告を表示
- 移行ガイドを提供

## 関連ドキュメント

- [ユーザーガイド](USER-GUIDE.md) - ツールの効果的な使用
- [ワークフロープロセス](WORKFLOW.md) - ワークフローでのツール使用
- [プロンプティングガイド](PROMPTING-GUIDE.md) - ツール使用の例
- [開発ガイド](DEVELOPMENT.md) - 新しいツールの追加

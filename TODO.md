# Preview Annotation Feature - Implementation TODO

## 概要
レンダリングされたマークダウン上で直接テキスト選択してアノテーションできる機能を実装

## 実装タスク

### Phase 1: ユーティリティ関数の実装
- [ ] `annotationUtils.ts` を新規作成
  - [ ] `TextSelector` 型定義
  - [ ] `MarkdownPosition` 型定義
  - [ ] `findTextInMarkdown()` 関数（ファジーマッチング）
  - [ ] `normalizeMarkdownForSearch()` 関数（マークダウン構文正規化）
  - [ ] `getTextContextBefore()` 関数（前方コンテキスト取得）
  - [ ] `getTextContextAfter()` 関数（後方コンテキスト取得）

### Phase 2: ApprovalsAnnotator の改修
- [ ] Annotateモードでレンダリング表示を使用
  - [ ] 現在の `<pre>` タグ表示を MDXEditorWrapper に置き換え
  - [ ] `handleRenderedSelectionMouseUp()` ハンドラを実装
  - [ ] コンテキスト情報を含むモーダル状態管理
- [ ] ハイライト表示の実装
  - [ ] レンダリング済みDOM上でのハイライト表示
  - [ ] TreeWalkerを使用したテキストノード走査
  - [ ] クリックイベントでコメント編集

### Phase 3: データ構造の拡張
- [ ] `ApprovalComment` 型に `textSelector` フィールドを追加（optional）
- [ ] 既存データとの互換性を確保

### Phase 4: テストと動作確認
- [ ] ファジーマッチングのテスト
- [ ] レンダリング表示でのアノテーション動作確認
- [ ] 既存アノテーションの表示確認
- [ ] エッジケースの確認（同一テキスト複数、マークダウン構文を跨ぐ選択など）

### Phase 5: UI/UX調整
- [ ] UIヒントの更新
- [ ] エラーハンドリング
- [ ] パフォーマンス最適化

## 完了条件
- [x] レンダリングされたマークダウン上でテキスト選択可能
- [ ] 選択したテキストにアノテーション追加可能
- [ ] ハイライトが正しく表示される
- [ ] 既存のアノテーション機能が動作する

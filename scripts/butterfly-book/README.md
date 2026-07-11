# Butterfly Garden Book — PDF ジェネレーター

Collector's Edition の1点、「Butterfly Garden Book」を生成するスクリプト。
**Webページ方式は使わず**、Node.jsで一度だけ実行して単一のPDFファイルを
作る方式。生成後はブラウザもサーバーも一切不要 — Windows/Mac/スマホ標準の
PDFビューアだけで開ける。

## 設計方針（なぜPlaywright/Puppeteerを使わないか）

Vercel上でChromiumを動かすのが困難という過去の制約に加えて、そもそも
「完全オフラインで、特殊ソフト不要」という絶対条件を満たすには、
ブラウザ経由のスクリーンショット/印刷よりも **pdf-lib で直接PDFを組み立てる**
方式の方が確実。フォント埋め込み・画像配置・PDFのしおり(bookmarks)まで
pdf-lib単体（+ @pdf-lib/fontkit）で完結する。

## 使い方

### 1. 依存関係インストール

```bash
cd scripts/butterfly-book
npm install
```

### 2. Firestoreからデータ書き出し

サービスアカウントキー（Firebase Console → プロジェクト設定 → サービス
アカウント → 新しい秘密鍵）を用意して:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npm run export
```

→ `entries.json` が生成される（削除依頼済みの投稿は自動的に除外）。

### 3. PDF生成

```bash
npm run build
```

→ リポジトリ直下に `butterfly-garden-book.pdf` が生成される。

動作確認用のサンプルデータで試したい場合:

```bash
npm run build:example
```

## デザイン仕様（LetterModalと合わせている点）

- 用紙: A4、各手紙＝1ページ以上（3000字までの長文は自動的に次ページへ続く）
- 便箋の背景グラデーション、ゴールド枠線 (#9c7238)
- 四隅装飾 (`corner_tl_new.png`)、上部の薔薇 (`rose_top.png`)、
  下部のクリスタル (`crystal_bottom.png`)
- 本文フォント: Klee One（手書き風）、挨拶文 "Dear MIKA": Cormorant
  Garamond Italic、送信者名・見出し: Noto Sans JP
- 表紙 + 目次(しおり形式のページ番号一覧) + 各手紙ページ
- **PDFのしおり(Outline)機能**を使い、目次からのジャンプおよびPDFビューア
  サイドバーからの各手紙への直接ジャンプに対応（Preview / Acrobat / 大半の
  スマホPDFアプリで動作確認済みの標準機能）

## 既知の制約・今後の調整ポイント

- ボイス付き投稿は本文ページに「🎤 Voice Collectionに収録」の一文のみ表示。
  実際の音声はVoice Collection（別ディバリアブル）側で扱う。
- 現状、蝶の種類(butterflyType)はページ内に表示していない（LetterModalの
  見た目自体にも表示されていないため、意図的に踏襲）。表示したい場合は
  `drawLetterEntry` に一行追加するだけで対応可能。
- ページごとの装飾スケール・余白は `generate-book.mjs` 冒頭の定数
  (`CARD_MARGIN_X`, `CARD_TOP`, `CARD_BOTTOM` 等)で調整可能。

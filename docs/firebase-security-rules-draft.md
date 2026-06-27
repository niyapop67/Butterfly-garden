# Firestore & Storage Security Rules — 草案

このプロジェクトのアクセス制御は、主にアプリケーション層（GATE 1 / GATE 2 の合言葉、
`src/middleware.ts` と `src/lib/privateExperienceAuth.ts`）で行う方針（v2.9差分メモ §2参照）。

ただし、合言葉ゲートを通らずに **Firebase の URL を直接叩く**（例：ブラウザの開発者ツールや
fetch で `https://firestore.googleapis.com/...` を直接呼ぶ）という経路は、ゲート1・ゲート2では
防げない。これを塞ぐ最低限のルールを以下に置く。今回のスコープでは「身内向け運用」のため
厳重な認可システムは作らないが、**書き込みの形式チェック**と**全件取得の抑制**だけは
Firestore Security Rules側でも担保しておく。

## Firestore Rules（`firestore.rules`）

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{submissionId} {
      // 読み取り：誰でも可（ガーデンページのニックネーム表示・カウント集計に必要）。
      // メッセージ本文・ボイスURLもこのレベルでは読めてしまうため、本文の真の保護は
      // 「フロントエンドがメッセージ本文を画面に出す前にGATE 2を要求する」運用に依存する。
      // 厳密にやるならフィールドレベルのアクセス制御や、本文を別コレクション
      // （/submissions_private など）に分離してCloud Functions経由でのみ読む構成が必要。
      // 今回のスコープではそこまでは行わない（要・将来判断）。
      allow read: if true;

      // 書き込み：新規作成のみ許可、更新・削除は禁止（送信後の編集不可、仕様通り）。
      allow create: if request.resource.data.keys().hasOnly(
                        ['nickname', 'message', 'butterflyType', 'voiceUrl',
                         'voiceDurationSeconds', 'createdAt']
                      )
                    && request.resource.data.nickname is string
                    && request.resource.data.nickname.size() > 0
                    && request.resource.data.nickname.size() <= 40
                    && request.resource.data.message is string
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 500
                    && request.resource.data.butterflyType in
                        ['pink-heart', 'tiffany-sky', 'crystal-white', 'aurora-dream',
                         'emerald-garden', 'golden-sunshine', 'twinkle-premium'];

      allow update, delete: if false;
    }
  }
}
```

## Storage Rules（`storage.rules`）

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /voices/{fileName} {
      // 読み取り：誰でも可（ガーデン/プライベート体験での再生に必要。
      // 本文と同様、URL自体は公開されるため真の保護は閲覧UI側のGATE 2運用に依存する）。
      allow read: if true;

      // 書き込み：新規アップロードのみ。webm・60秒分の想定サイズ（上限5MB）を超えるものは拒否。
      allow create: if request.resource.size < 5 * 1024 * 1024
                    && request.resource.contentType == 'audio/webm';
      allow update, delete: if false;
    }
  }
}
```

## 今回やらないこと（将来検討）

- メッセージ本文・ボイスURLをFirestore/Storageレベルで本当に隠す（GATE 2をクライアントだけでなく
  サーバー側でも強制する）には、Cloud Functions経由のAPI化や、本文を別コレクションに分けて
  Functionsからのみ読む構成が必要。今回は「身内向け運用＋UI上のGATE 2」で運用する前提のため
  見送る。本格的に必要になったタイミングで再検討する。
- レート制限（同一IPからの連投制限など）は今回未実装。

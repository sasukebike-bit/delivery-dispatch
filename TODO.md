# 配車管理システム タスク表

> 仕様書: [SPEC.md](./SPEC.md)

---

## 環境構築

- [ ] リポジトリのクローン
- [ ] 依存関係のインストール (`npm install`)
- [ ] `.env` ファイルの設定（DATABASE_URL / AUTH_SECRET / AUTH_URL）
- [ ] PostgreSQL データベースの作成
- [ ] DBマイグレーション実行 (`npm run db:migrate`)
- [ ] 初期データ投入 (`npm run db:seed`)
- [ ] 開発サーバー起動確認 (`npm run dev`)

---

## データベース

- [ ] User モデルの定義
- [ ] Driver モデルの定義
- [ ] Order モデルの定義
- [ ] Role enum（ADMIN / DRIVER）
- [ ] DriverStatus enum（AVAILABLE / BUSY / OFFLINE）
- [ ] OrderStatus enum（PENDING / ASSIGNED / IN_TRANSIT / DELIVERED / CANCELLED）

---

## 認証

- [ ] ログイン画面（`/login`）
- [ ] NextAuth.js Credentials プロバイダー設定
- [ ] bcryptjs によるパスワードハッシュ化
- [ ] セッションへのロール情報付与
- [ ] ミドルウェアによるルート保護
  - [ ] 未認証 → `/login` リダイレクト
  - [ ] DRIVER が管理者画面アクセス → DRIVER画面リダイレクト
  - [ ] ADMIN が DRIVER画面アクセス → Admin画面リダイレクト

---

## 管理者機能

### ダッシュボード

- [ ] 注文統計の表示（件数・ステータス別）
- [ ] 注文一覧の表示

### 注文管理

- [ ] 注文一覧ページ（`/orders`）
- [ ] 注文新規作成ページ（`/orders/new`）
  - [ ] タイトル入力
  - [ ] 集荷先住所入力
  - [ ] 配達先住所入力
  - [ ] メモ入力（任意）
- [ ] 注文詳細・編集ページ（`/orders/[id]`）
  - [ ] 注文情報の編集
  - [ ] ドライバーの割り当て
  - [ ] ステータスの変更
  - [ ] 注文の削除

### ドライバー管理

- [ ] ドライバー一覧ページ（`/drivers`）
- [ ] ドライバー新規登録ページ（`/drivers/new`）
  - [ ] 氏名・メール・パスワード入力
  - [ ] 電話番号・車両情報入力
- [ ] ドライバー詳細・編集ページ（`/drivers/[id]`）
  - [ ] 電話番号・車両情報の編集
  - [ ] ステータスの変更
  - [ ] 直近10件の注文履歴表示

---

## ドライバー機能

- [ ] ドライバーダッシュボード（`/driver/dashboard`）
- [ ] 担当注文一覧（`/driver/orders`）
- [ ] 担当注文詳細（`/driver/orders/[id]`）
  - [ ] ステータス更新（配送開始 / 配達完了）

---

## API実装

### 注文 API

- [ ] `GET /api/orders` - 注文一覧取得
  - [ ] ADMINは全件取得
  - [ ] DRIVERは自分の担当注文のみ取得
  - [ ] `status` / `driverId` フィルタ対応
- [ ] `POST /api/orders` - 注文新規作成（ADMIN のみ）
- [ ] `GET /api/orders/[id]` - 注文詳細取得
- [ ] `PATCH /api/orders/[id]` - 注文更新
  - [ ] ADMINは全フィールド更新可能
  - [ ] DRIVERは `status` のみ更新可能（自分の担当注文のみ）
- [ ] `DELETE /api/orders/[id]` - 注文削除（ADMIN のみ）

### ドライバー API

- [ ] `GET /api/drivers` - ドライバー一覧取得（ADMIN のみ）
- [ ] `POST /api/drivers` - ドライバー新規登録（ADMIN のみ）
- [ ] `GET /api/drivers/[id]` - ドライバー詳細取得（ADMIN のみ）
- [ ] `PATCH /api/drivers/[id]` - ドライバー情報更新（ADMIN のみ）
- [ ] `DELETE /api/drivers/[id]` - ドライバー削除（ADMIN のみ）

---

## ビジネスロジック

- [ ] ドライバー割り当て時に OrderStatus → ASSIGNED に自動変更
- [ ] ドライバー割り当て時に DriverStatus → BUSY に自動変更
- [ ] ドライバー解除時、他に進行中注文がなければ DriverStatus → AVAILABLE に自動変更

---

## テスト・品質

- [ ] デモアカウントでのログイン確認（admin / driver）
- [ ] 管理者機能の動作確認
- [ ] ドライバー機能の動作確認
- [ ] ロール別アクセス制御の確認
- [ ] 注文ステータス遷移の確認

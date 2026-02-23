# 配車管理システム 仕様書

**リポジトリ**: sasukebike-bit/delivery-dispatch
**作成日**: 2026-02-23

---

## 1. システム概要

デリバリー・物流向けの配車管理Webアプリ。管理者が注文を登録・管理しドライバーに割り当て、ドライバーは自分の担当注文を確認・ステータス更新できる。

---

## 2. 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| ORM | Prisma 7 |
| データベース | PostgreSQL（ローカル または Supabase） |
| 認証 | NextAuth.js v5（Credentials + ロール管理） |

---

## 3. ユーザーロール

| ロール | 説明 |
|--------|------|
| ADMIN | 管理者。全機能にアクセス可能 |
| DRIVER | ドライバー。自分の担当注文のみ閲覧・ステータス更新可能 |

---

## 4. データモデル

### 4-1. User（ユーザー）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | String (cuid) | 主キー |
| name | String | 氏名 |
| email | String (unique) | メールアドレス |
| password | String | ハッシュ済みパスワード |
| role | Role | ADMIN / DRIVER |
| createdAt | DateTime | 作成日時 |

### 4-2. Driver（ドライバー）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | String (cuid) | 主キー |
| userId | String (unique) | Userへの外部キー |
| phone | String | 電話番号 |
| vehicle | String | 車両情報 |
| status | DriverStatus | AVAILABLE / BUSY / OFFLINE |

### 4-3. Order（注文）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | String (cuid) | 主キー |
| title | String | 注文タイトル |
| pickupAddress | String | 集荷先住所 |
| deliveryAddress | String | 配達先住所 |
| memo | String? | メモ（任意） |
| status | OrderStatus | 注文ステータス |
| driverId | String? | 担当ドライバーID（任意） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### 4-4. ステータス定義

**DriverStatus（ドライバー状態）**

| 値 | 説明 |
|----|------|
| AVAILABLE | 対応可能 |
| BUSY | 配送中 |
| OFFLINE | オフライン |

**OrderStatus（注文状態）**

| 値 | 説明 |
|----|------|
| PENDING | 未割り当て |
| ASSIGNED | ドライバー割り当て済み |
| IN_TRANSIT | 配送中 |
| DELIVERED | 配達完了 |
| CANCELLED | キャンセル |

---

## 5. 画面構成

### 5-1. 共通

| パス | 説明 |
|------|------|
| `/` | ルート（ログイン状態に応じてリダイレクト） |
| `/login` | ログイン画面 |

### 5-2. 管理者画面（`/dashboard`〜）

| パス | 説明 |
|------|------|
| `/dashboard` | 管理者ダッシュボード（注文統計・一覧） |
| `/orders` | 注文一覧 |
| `/orders/new` | 注文新規作成 |
| `/orders/[id]` | 注文詳細・編集・ドライバー割り当て |
| `/drivers` | ドライバー一覧 |
| `/drivers/new` | ドライバー新規登録 |
| `/drivers/[id]` | ドライバー詳細・編集 |

### 5-3. ドライバー画面

| パス | 説明 |
|------|------|
| `/driver/dashboard` | ドライバーダッシュボード（担当注文一覧） |
| `/driver/orders` | 担当注文一覧 |
| `/driver/orders/[id]` | 担当注文詳細・ステータス更新 |

---

## 6. API仕様

### 6-1. 注文 API

#### `GET /api/orders`
- **権限**: ログイン済みユーザー
- **説明**: 注文一覧を取得
  - ADMINは全注文を取得（`status`, `driverId` でフィルタ可能）
  - DRIVERは自分の担当注文のみ取得
- **クエリパラメータ**:
  - `status`: OrderStatus でフィルタ（任意）
  - `driverId`: ドライバーID でフィルタ（任意、管理者のみ有効）
- **レスポンス**: 注文一覧（ドライバー情報含む）

#### `POST /api/orders`
- **権限**: ADMIN のみ
- **説明**: 注文を新規作成
- **リクエストボディ**:
  ```json
  {
    "title": "string (必須)",
    "pickupAddress": "string (必須)",
    "deliveryAddress": "string (必須)",
    "memo": "string (任意)"
  }
  ```
- **レスポンス**: 作成した注文 (201)

#### `GET /api/orders/[id]`
- **権限**: ログイン済みユーザー
- **説明**: 注文詳細を取得（ドライバー情報含む）

#### `PATCH /api/orders/[id]`
- **権限**: ログイン済みユーザー
- **説明**: 注文を更新
  - ADMIN: 全フィールド更新可能。ドライバー割り当て時にOrderStatus=ASSIGNED・DriverStatus=BUSY に自動変更
  - DRIVER: `status` フィールドのみ更新可能（自分の担当注文のみ）
- **リクエストボディ（管理者）**:
  ```json
  {
    "title": "string",
    "pickupAddress": "string",
    "deliveryAddress": "string",
    "memo": "string",
    "status": "OrderStatus",
    "driverId": "string | null"
  }
  ```
- **リクエストボディ（ドライバー）**:
  ```json
  {
    "status": "OrderStatus"
  }
  ```

#### `DELETE /api/orders/[id]`
- **権限**: ADMIN のみ
- **説明**: 注文を削除

---

### 6-2. ドライバー API

#### `GET /api/drivers`
- **権限**: ADMIN のみ
- **説明**: ドライバー一覧を取得（注文件数含む）

#### `POST /api/drivers`
- **権限**: ADMIN のみ
- **説明**: ドライバーを新規登録（User + Driver を同時作成）
- **リクエストボディ**:
  ```json
  {
    "name": "string (必須)",
    "email": "string (必須)",
    "password": "string (必須)",
    "phone": "string (必須)",
    "vehicle": "string (必須)"
  }
  ```
- **レスポンス**: 作成したドライバー情報 (201)

#### `GET /api/drivers/[id]`
- **権限**: ADMIN のみ
- **説明**: ドライバー詳細（直近10件の注文履歴含む）

#### `PATCH /api/drivers/[id]`
- **権限**: ADMIN のみ
- **説明**: ドライバー情報を更新
- **リクエストボディ**:
  ```json
  {
    "phone": "string",
    "vehicle": "string",
    "status": "DriverStatus"
  }
  ```

#### `DELETE /api/drivers/[id]`
- **権限**: ADMIN のみ
- **説明**: ドライバーを削除

---

## 7. 認証仕様

- NextAuth.js v5 の Credentials プロバイダーを使用
- メールアドレス + パスワード認証（bcryptjs でハッシュ化）
- セッションにロール情報（ADMIN / DRIVER）を付与
- ミドルウェアでロール別にルートを保護
  - 未認証 → `/login` にリダイレクト
  - DRIVER がAdmin画面にアクセス → DRIVER画面にリダイレクト
  - ADMIN がDriver画面にアクセス → Admin画面にリダイレクト

---

## 8. ビジネスロジック

### ドライバー割り当て時の自動ステータス変更

| 操作 | OrderStatus 変更 | DriverStatus 変更 |
|------|-----------------|------------------|
| ドライバーを割り当て | → ASSIGNED | → BUSY |
| ドライバーを解除 | 変更なし | 他に進行中注文がなければ → AVAILABLE |

### ドライバーが更新できるステータス遷移

ドライバーは自分の担当注文の `status` のみ変更可能。
想定フロー: `ASSIGNED` → `IN_TRANSIT` → `DELIVERED`

---

## 9. セットアップ手順

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env
# .env を編集:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/delivery_dispatch"
# AUTH_SECRET="your-secret-here"
# AUTH_URL="http://localhost:3000"

# 3. DBマイグレーション
npm run db:migrate

# 4. 初期データ投入
npm run db:seed

# 5. 開発サーバー起動
npm run dev
# → http://localhost:3000
```

---

## 10. デモアカウント

| ロール | メール | パスワード |
|--------|--------|-----------|
| 管理者 | admin@example.com | admin123 |
| ドライバー | yamada@example.com | driver123 |
| ドライバー | suzuki@example.com | driver123 |

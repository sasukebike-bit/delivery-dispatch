# 配車管理システム

デリバリー・物流向けの配車管理Webアプリ。管理者が注文を登録しドライバーに割り当て、ドライバーは担当注文を確認できます。

## 技術スタック

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Prisma 7** (ORM)
- **PostgreSQL**（ローカル または Supabase）
- **NextAuth.js v5**（Credentials + ロール管理）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、データベース接続情報を設定します。

```bash
cp .env.example .env
```

`.env` を編集：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/delivery_dispatch"
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
```

### 3. データベースのセットアップ

```bash
# マイグレーション実行
npm run db:migrate

# 初期データの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

→ http://localhost:3000

## デモアカウント

| ロール | メール | パスワード |
|--------|--------|-----------|
| 管理者 | admin@example.com | admin123 |
| ドライバー | yamada@example.com | driver123 |
| ドライバー | suzuki@example.com | driver123 |

## 機能

### 管理者
- ダッシュボード（注文統計・一覧）
- 注文の作成・編集・ステータス変更
- ドライバーへの注文割り当て
- ドライバーの登録・編集

### ドライバー
- 担当注文の確認
- ステータス更新（配送開始 / 配達完了）

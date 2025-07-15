# Supabase 設定指南

本專案已從 Neon 資料庫轉換為使用 Supabase。請按照以下步驟設定您的 Supabase 專案。

## 1. 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com/)
2. 註冊帳號並建立新專案
3. 等待專案初始化完成

## 2. 設定環境變數

在專案根目錄建立 `.env.local` 檔案，並加入以下環境變數：

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI API Key (原有設定)
GEMINI_API_KEY=your_gemini_api_key
```

### 取得 Supabase 環境變數：

1. 在 Supabase Dashboard 中，前往 **Settings** > **API**
2. 複製 **Project URL** 作為 `NEXT_PUBLIC_SUPABASE_URL`
3. 複製 **anon/public key** 作為 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. 建立資料表

在 Supabase Dashboard 中，前往 **SQL Editor** 並執行以下 SQL：

```sql
-- 建立 comics 資料表
CREATE TABLE comics (
  id SERIAL PRIMARY KEY,
  user_prompt TEXT NOT NULL,
  style VARCHAR(50) NOT NULL,
  panel_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立 comic_panels 資料表
CREATE TABLE comic_panels (
  id SERIAL PRIMARY KEY,
  comic_id INTEGER REFERENCES comics(id) ON DELETE CASCADE,
  panel_number INTEGER NOT NULL,
  script_text TEXT NOT NULL,
  script_description TEXT,
  image_url TEXT NOT NULL,
  image_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comic_id, panel_number)
);

-- 建立索引以提升查詢效能
CREATE INDEX idx_comics_created_at ON comics(created_at DESC);
CREATE INDEX idx_comic_panels_comic_id ON comic_panels(comic_id);
```

## 4. 設定 Row Level Security (RLS) - 可選

如果您想要啟用 RLS 以提高安全性：

```sql
-- 啟用 RLS
ALTER TABLE comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comic_panels ENABLE ROW LEVEL SECURITY;

-- 允許所有操作的基本政策 (開發階段)
CREATE POLICY "Allow all operations" ON comics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON comic_panels FOR ALL USING (true);
```

## 5. 測試連接

啟動專案後，您可以透過以下方式測試資料庫連接：

```bash
npm run dev
```

然後訪問 API 端點來測試資料庫初始化：

- POST `/api/db/init` - 測試資料庫連接

## 變更摘要

- ✅ 移除 `@neondatabase/serverless` 套件
- ✅ 安裝 `@supabase/supabase-js` 套件
- ✅ 更新 `lib/db/supabase.ts` 配置檔案
- ✅ 更新所有 API 路由以使用 Supabase
- ✅ 保持相同的資料表結構和 API 介面

所有原有功能都會正常運作，只是資料儲存後端從 Neon 改為 Supabase。

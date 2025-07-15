# SUPABASE 資料庫設定

## 必要的依賴項目

```bash
npm install @supabase/supabase-js
```

## 環境變數設定

建立 `.env.local` 檔案並添加：

```
# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 資料庫初始化

第一次使用前，需要在 Supabase Dashboard 中建立資料表，然後呼叫初始化 API 測試連接：

```bash
POST /api/db/init
```

## 可用的 API 端點

- `POST /api/db/init` - 測試資料庫連接
- `GET /api/comics` - 取得漫畫列表 (支援 ?limit=N 參數)
- `GET /api/comics/[id]` - 取得特定漫畫詳細資料
- `POST /api/generate-comic` - 生成漫畫並自動儲存到資料庫

## 資料表結構

- `comics`: 漫畫主要資訊
- `comic_panels`: 漫畫面板詳細資料

## 從 Neon 轉換到 Supabase

專案已從 Neon 資料庫轉換為 Supabase，提供更好的 API 和開發體驗。詳細設定說明請參考 `SUPABASE_SETUP.md`。

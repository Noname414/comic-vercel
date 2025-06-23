# AI 漫畫生成器

使用 Gemini AI 將您的想法轉換成精美的漫畫分鏡。本專案使用 Next.js 14、TypeScript 和 Tailwind CSS 開發，並部署在 Vercel 上。

## 功能特點

- 🎨 多種漫畫風格選擇（少年漫畫、韓式漫畫、黑白畫風、Q 版等）
- 🖼️ 支援 2-6 格漫畫分鏡生成
- ⚡ 使用 Gemini 2.0 Flash 模型快速生成圖片
- 💅 美觀的使用者介面，響應式設計
- 🔄 即時顯示生成進度和錯誤處理

## 技術堆疊

- **前端框架**: Next.js 14 (App Router)
- **程式語言**: TypeScript
- **樣式框架**: Tailwind CSS
- **AI 模型**: Gemini 2.0 Flash (支援圖片生成)
- **部署平台**: Vercel

## 開始使用

### 前置需求

- Node.js 18+ 和 npm
- Gemini API Key（從 [Google AI Studio](https://makersuite.google.com/app/apikey) 取得）

### 安裝步驟

1. 克隆專案

```bash
git clone https://github.com/your-username/comic-vercel.git
cd comic-vercel
```

2. 安裝依賴

```bash
npm install
```

3. 設定環境變數

```bash
# 複製環境變數範本
cp .env.local.example .env.local

# 編輯 .env.local，加入您的 Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

4. 啟動開發伺服器

```bash
npm run dev
```

5. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 使用說明

1. 在輸入框中描述您想要生成的漫畫場景
2. 選擇漫畫風格（例如：少年漫畫、Q 版等）
3. 選擇分鏡數量（2-6 格）
4. 點擊「生成漫畫」按鈕
5. 等待 AI 生成您的漫畫分鏡

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/comic-vercel)

1. 點擊上方按鈕
2. 在 Vercel 設定環境變數 `GEMINI_API_KEY`
3. 部署完成！

## 專案結構

```
comic-vercel/
├── app/
│   ├── api/
│   │   └── generate-comic/    # API 路由處理漫畫生成
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主頁面
├── components/
│   └── ComicGenerator.tsx     # 漫畫生成器元件
├── types/
│   └── comic.ts               # TypeScript 類型定義
├── public/                    # 靜態資源
└── package.json
```

## API 端點

### POST `/api/generate-comic`

生成漫畫分鏡的 API 端點。

**請求格式：**

```json
{
  "prompt": "描述您想要的漫畫場景",
  "style": "manga",
  "panelCount": 4
}
```

**回應格式：**

```json
{
  "images": ["base64_image_1", "base64_image_2", ...],
  "message": "成功生成 4 個漫畫分鏡"
}
```

## 注意事項

- Gemini API 的圖片生成功能可能在某些地區不可用
- 每次生成可能需要 10-30 秒，取決於網路速度和 API 響應時間
- 建議使用詳細的描述以獲得更好的生成效果

## 授權

MIT License

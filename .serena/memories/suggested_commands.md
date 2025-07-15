# 建議指令

## 專案指令 (npm)

- **啟動開發伺服器**: `npm run dev`
  - 使用 Next.js 的 Turbopack 快速啟動本地開發環境。
- **建置專案**: `npm run build`
  - 為生產環境建置應用程式。
- **啟動生產伺服器**: `npm run start`
  - 啟動一個已建置完成的 Next.js 應用程式。
- **執行程式碼檢查**: `npm run lint`
  - 使用 ESLint 檢查程式碼中的錯誤和風格問題。

## 任務完成後流程

完成一項開發任務後，建議執行以下指令以確保程式碼品質：

1. `npm run lint`

## 系統工具 (PowerShell)

- **列出檔案**: `ls` 或 `Get-ChildItem`
- **切換目錄**: `cd <目錄路徑>`
- **建立目錄**: `mkdir <目錄名稱>`
- **查看檔案內容**: `cat <檔案路徑>` 或 `Get-Content <檔案路徑>`
- **全域搜尋**: `findstr /S /I "<搜尋字串>" *.*` (簡易搜尋) 或 `Select-String -Path ".\*" -Pattern "<搜尋字串>" -Recurse` (功能更強)

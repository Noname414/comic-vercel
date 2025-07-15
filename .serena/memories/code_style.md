# 程式碼風格與慣例

## TypeScript

- **嚴格模式**: 專案啟用 `strict: true`，強制執行嚴格的型別檢查。
- **路徑別名**: 使用 `@/*` 來代表專案根目錄 (`./*`)，便於絕對路徑匯入。例如：`import Component from '@/components/MyComponent'`。
- **模組系統**: 使用 ESNext 模組和 `bundler` 解析策略。

## 樣式

- **框架**: 使用 Tailwind CSS 進行樣式設計。應遵循 Tailwind 的功能優先 (utility-first) 原則。

## 程式碼品質

- **Linter**: 使用 ESLint 進行程式碼風格檢查。設定檔為 `eslint.config.mjs`。
- **格式化**: 雖然未明確指定格式化工具 (如 Prettier)，但應遵循 ESLint 的規則以保持一致性。

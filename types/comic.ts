// 漫畫風格類型
export type ComicStyle = 
  | 'manga' // 少年漫畫
  | 'webtoon' // 韓式漫畫
  | 'blackwhite' // 黑白畫風
  | 'chibi' // Q版
  | 'realistic' // 寫實風格
  | 'watercolor'; // 水彩風格

// 單個分鏡腳本
export interface PanelScript {
  panelNumber: number;
  description: string;
  dialogue?: string;
  mood: string;
}

// 生成請求的介面
export interface GenerateComicRequest {
  prompt: string;
  style: ComicStyle;
  panelCount: number; // 分鏡數量
}

// 生成回應的介面
export interface GenerateComicResponse {
  images: string[]; // Base64 編碼的圖片陣列
  scripts: PanelScript[]; // 每格的腳本
  message?: string;
  error?: string;
}

// 單個分鏡的介面
export interface ComicPanel {
  id: string;
  imageData: string;
  script: PanelScript;
} 
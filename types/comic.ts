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

// ===================
// 資料庫相關類型
// ===================

// 資料庫中的漫畫記錄
export interface DatabaseComic {
  id: number;
  user_prompt: string;
  style: ComicStyle;
  panel_count: number;
  created_at: Date;
  updated_at: Date;
}

// 資料庫中的面板記錄
export interface DatabaseComicPanel {
  id: number;
  comic_id: number;
  panel_number: number;
  script_text: string;
  script_description?: string;
  image_url: string;
  image_prompt?: string;
  created_at: Date;
}

// 儲存漫畫的請求資料
export interface SaveComicData {
  userPrompt: string;
  style: ComicStyle;
  panelCount: number;
  panels: Array<{
    panelNumber: number;
    scriptText: string;
    scriptDescription?: string;
    imageUrl: string;
    imagePrompt?: string;
  }>;
}

// 完整的漫畫資料（包含面板）
export interface FullComic extends DatabaseComic {
  panels: DatabaseComicPanel[];
}

// 資料庫查詢返回的面板格式（camelCase）
export interface ComicPanelResponse {
  id: number;
  panelNumber: number;
  scriptText: string;
  scriptDescription?: string;
  imageUrl: string;
  imagePrompt?: string;
}

// 完整的漫畫資料（包含查詢返回的面板格式）
export interface FullComicResponse extends DatabaseComic {
  panels: ComicPanelResponse[];
}

// 漫畫列表項目
export interface ComicListItem {
  id: number;
  user_prompt: string;
  style: ComicStyle;
  panel_count: number;
  created_at: Date;
}

// 更新的生成回應介面（包含資料庫 ID）
export interface GenerateComicResponseWithDB extends GenerateComicResponse {
  comicId?: number;
  createdAt?: Date;
} 

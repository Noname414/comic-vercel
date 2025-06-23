import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { GenerateComicRequest, GenerateComicResponse, ComicStyle } from "@/types/comic";

// 初始化 Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// 根據風格生成對應的提示詞修飾
function getStylePrompt(style: ComicStyle): string {
  const styleMap: Record<ComicStyle, string> = {
    manga: "manga style, anime style, Japanese comic art",
    webtoon: "webtoon style, Korean comic style, vertical comic panels",
    blackwhite: "black and white ink drawing, monochrome comic art",
    chibi: "chibi style, cute super deformed characters, kawaii art",
    realistic: "realistic comic art, detailed illustration",
    watercolor: "watercolor comic style, soft colors, artistic painting"
  };
  return styleMap[style] || "";
}

// 生成單個分鏡的函數
async function generatePanel(prompt: string, style: ComicStyle, panelNumber: number): Promise<string> {
  const stylePrompt = getStylePrompt(style);
  const fullPrompt = `Create a comic panel ${panelNumber}: ${prompt}, ${stylePrompt}, comic book style, clear storytelling`;

  try {
    console.log(`🎨 開始生成分鏡 ${panelNumber}...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: fullPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    
    // 檢查回應結構
    if (!response) {
      throw new Error("API 回應為空");
    }
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("API 回應中沒有候選結果");
    }
    
    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("第一個候選結果為空");
    }
    
    if (!candidate.content) {
      throw new Error("候選結果中沒有內容");
    }
    
    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("候選結果內容中沒有部分");
    }
    
    // 提取生成的圖片數據
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const dataSize = Math.round(part.inlineData.data.length / 1024); // KB
        console.log(`✅ 分鏡 ${panelNumber} 生成成功 (${dataSize}KB)`);
        return part.inlineData.data; // 返回 base64 編碼的圖片
      }
    }
    
    throw new Error("未能在回應中找到圖片數據");
  } catch (error) {
    console.error(`❌ 生成分鏡 ${panelNumber} 失敗:`, error instanceof Error ? error.message : error);
    
    // 如果是網路或 API 配額問題，拋出更具體的錯誤
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error(`API 配額不足或達到限制 (分鏡 ${panelNumber})`);
      }
      if (error.message.includes("not available") || error.message.includes("region")) {
        throw new Error(`圖片生成功能在此地區不可用 (分鏡 ${panelNumber})`);
      }
      if (error.message.includes("API key")) {
        throw new Error(`API Key 無效或未設定 (分鏡 ${panelNumber})`);
      }
    }
    
    throw new Error(`生成分鏡 ${panelNumber} 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateComicRequest;
    const { prompt, style, panelCount = 4 } = body;

    console.log(`📝 收到生成請求: ${panelCount}格 ${style}風格漫畫`);

    // 驗證輸入
    if (!prompt || !style) {
      return NextResponse.json(
        { error: "請提供描述和風格" },
        { status: 400 }
      );
    }

    if (panelCount < 1 || panelCount > 6) {
      return NextResponse.json(
        { error: "分鏡數量必須在 1-6 之間" },
        { status: 400 }
      );
    }

    // 驗證 API Key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY 環境變數未設定');
      return NextResponse.json(
        { error: "伺服器配置錯誤：API Key 未設定" },
        { status: 500 }
      );
    }

    // 為每個分鏡生成不同的場景描述
    const panelPrompts = [];
    for (let i = 1; i <= panelCount; i++) {
      // 根據原始提示生成序列化的分鏡描述
      const panelPrompt = `${prompt} (scene ${i} of ${panelCount})`;
      panelPrompts.push(panelPrompt);
    }

    console.log(`🚀 開始生成 ${panelCount} 個分鏡...`);

    // 為了避免並行請求導致的問題，改為序列生成
    const images: string[] = [];
    for (let i = 0; i < panelPrompts.length; i++) {
      try {
        const image = await generatePanel(panelPrompts[i], style, i + 1);
        images.push(image);
      } catch (error) {
        console.error(`❌ 生成分鏡 ${i + 1} 失敗:`, error instanceof Error ? error.message : error);
        throw error; // 重新拋出錯誤以停止整個流程
      }
    }

    console.log(`🎉 所有分鏡生成完成！`);

    const response: GenerateComicResponse = {
      images,
      message: `成功生成 ${panelCount} 個漫畫分鏡`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ 生成漫畫時發生錯誤:", error instanceof Error ? error.message : error);
    
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    
    return NextResponse.json(
      { error: `生成失敗: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
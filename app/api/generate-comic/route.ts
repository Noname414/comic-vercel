import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { GenerateComicRequest, GenerateComicResponse, ComicStyle, PanelScript } from "@/types/comic";

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

// 生成分鏡腳本
async function generatePanelScripts(storyPrompt: string, panelCount: number, style: ComicStyle): Promise<PanelScript[]> {
  console.log(`📝 開始生成 ${panelCount} 格分鏡腳本...`);
  
  const scriptPrompt = `你是一位專業的漫畫編劇。請根據以下故事概念，創作一個 ${panelCount} 格的漫畫分鏡腳本。

故事概念: ${storyPrompt}
風格: ${style}
分鏡數量: ${panelCount} 格

請為每一格提供：
1. 場景描述 (詳細的視覺元素)
2. 對話內容 (如果有的話)
3. 情緒氛圍 (如緊張、歡樂、神秘等)

請以 JSON 格式回應，格式如下：
{
  "panels": [
    {
      "panelNumber": 1,
      "description": "詳細的場景和角色描述，包含環境、角色動作、表情等",
      "dialogue": "角色對話內容（可選）",
      "mood": "這格的情緒氛圍"
    }
  ]
}

確保每格都有連貫的故事情節，並且適合 ${style} 風格的視覺表現。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scriptPrompt,
    });

    const responseText = response.text || "";
    console.log('📄 腳本生成回應:', responseText);

    // 嘗試解析 JSON 回應
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("無法從回應中提取 JSON 格式的腳本");
    }

    const scriptData = JSON.parse(jsonMatch[0]);
    
    if (!scriptData.panels || !Array.isArray(scriptData.panels)) {
      throw new Error("腳本格式無效");
    }

    console.log(`✅ 成功生成 ${scriptData.panels.length} 格腳本`);
    return scriptData.panels;

  } catch (error) {
    console.error(`❌ 生成腳本失敗:`, error);
    
    // 如果腳本生成失敗，創建簡單的備用腳本
    console.log('🔄 使用備用腳本生成方式...');
    const fallbackScripts: PanelScript[] = [];
    for (let i = 1; i <= panelCount; i++) {
      fallbackScripts.push({
        panelNumber: i,
        description: `${storyPrompt} (scene ${i} of ${panelCount})`,
        dialogue: "",
        mood: "neutral"
      });
    }
    return fallbackScripts;
  }
}

// 使用 LLM 優化圖片生成提示詞
async function optimizeImagePrompt(script: PanelScript, style: ComicStyle): Promise<string> {
  const stylePrompt = getStylePrompt(style);
  
  // 構建基礎提示
  let basicPrompt = `Comic panel ${script.panelNumber}: ${script.description}`;
  
  if (script.dialogue) {
    basicPrompt += `. Characters saying: "${script.dialogue}"`;
  }
  
  basicPrompt += `. Mood: ${script.mood}. Style: ${stylePrompt}`;

  const optimizationPrompt = `你是一位專業的 AI 圖片生成提示詞專家。請將以下漫畫分鏡描述優化成適合圖片生成模型理解的詳細 prompt。

原始分鏡描述：
${basicPrompt}

請優化成包含以下元素的詳細 prompt：
1. 具體的視覺構圖描述
2. 詳細的角色外觀和動作
3. 精確的場景環境描述
4. 明確的藝術風格指示
5. 技術品質要求

請直接回傳優化後的英文 prompt，不需要其他說明文字。確保 prompt 適合圖片生成 AI 使用，具體且描述性強。`;

  try {
    console.log(`🔧 正在優化分鏡 ${script.panelNumber} 的提示詞...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: optimizationPrompt,
    });

    const optimizedPrompt = response.text?.trim() || basicPrompt;
    console.log(`✅ 分鏡 ${script.panelNumber} 提示詞優化完成`);
    console.log(`📝 優化後提示詞: ${optimizedPrompt.substring(0, 100)}...`);
    
    return optimizedPrompt;

  } catch (error) {
    console.error(`❌ 優化分鏡 ${script.panelNumber} 提示詞失敗:`, error);
    // 如果優化失敗，返回基礎提示詞
    return basicPrompt + ", comic book panel, clear storytelling, professional comic art";
  }
}

// 根據腳本生成單個分鏡圖片
async function generatePanelImage(script: PanelScript, style: ComicStyle): Promise<string> {
  // 使用 LLM 優化圖片生成提示詞
  const imagePrompt = await optimizeImagePrompt(script, style);

  try {
    console.log(`🎨 開始生成分鏡 ${script.panelNumber} 圖片...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: imagePrompt,
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
        console.log(`✅ 分鏡 ${script.panelNumber} 生成成功 (${dataSize}KB)`);
        return part.inlineData.data; // 返回 base64 編碼的圖片
      }
    }
    
    throw new Error("未能在回應中找到圖片數據");
  } catch (error) {
    console.error(`❌ 生成分鏡 ${script.panelNumber} 圖片失敗:`, error instanceof Error ? error.message : error);
    
    // 如果是網路或 API 配額問題，拋出更具體的錯誤
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error(`API 配額不足或達到限制 (分鏡 ${script.panelNumber})`);
      }
      if (error.message.includes("not available") || error.message.includes("region")) {
        throw new Error(`圖片生成功能在此地區不可用 (分鏡 ${script.panelNumber})`);
      }
      if (error.message.includes("API key")) {
        throw new Error(`API Key 無效或未設定 (分鏡 ${script.panelNumber})`);
      }
    }
    
    throw new Error(`生成分鏡 ${script.panelNumber} 圖片失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateComicRequest;
    const { prompt, style, panelCount = 4 } = body;

    console.log(`📝 收到漫畫創作請求: ${panelCount}格 ${style}風格`);
    console.log(`📖 故事概念: ${prompt}`);

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

    // 第一步：生成分鏡腳本
    const scripts = await generatePanelScripts(prompt, panelCount, style);
    
    console.log(`🚀 開始根據腳本生成 ${scripts.length} 張圖片...`);

    // 第二步：根據腳本生成圖片
    const images: string[] = [];
    for (const script of scripts) {
      try {
        const image = await generatePanelImage(script, style);
        images.push(image);
      } catch (error) {
        console.error(`❌ 生成分鏡 ${script.panelNumber} 失敗:`, error instanceof Error ? error.message : error);
        throw error; // 重新拋出錯誤以停止整個流程
      }
    }

    console.log(`🎉 漫畫創作完成！`);

    const response: GenerateComicResponse = {
      images,
      scripts,
      message: `成功創作 ${panelCount} 格漫畫，包含完整分鏡腳本`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ 創作漫畫時發生錯誤:", error instanceof Error ? error.message : error);
    
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    
    return NextResponse.json(
      { error: `創作失敗: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
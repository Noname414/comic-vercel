import { GoogleGenAI, Modality, Type } from "@google/genai";
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

重要提醒：
- 避免過度描述暴力、武器、傷口等內容
- 可以用「歷練的痕跡」代替「傷疤」
- 可以用「古老的器物」代替「武器」
- 可以用「紅色印記」代替「血跡」
- 可以用「古老遺跡」代替「廢墟」
- 注重情感表達而非視覺衝擊

請為每一格提供：
1. 場景描述 (詳細的視覺元素，但避免過於激烈的描述)
2. 對話內容 (如果有的話)
3. 情緒氛圍 (如堅定、希望、思考等正面情緒)

確保每格都有連貫的故事情節，並且適合 ${style} 風格的視覺表現。內容應該積極正面，適合所有年齡層觀看。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scriptPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: {
                    type: Type.NUMBER,
                  },
                  description: {
                    type: Type.STRING,
                  },
                  dialogue: {
                    type: Type.STRING,
                  },
                  mood: {
                    type: Type.STRING,
                  },
                },
                propertyOrdering: ["panelNumber", "description", "dialogue", "mood"],
              },
            },
          },
          propertyOrdering: ["panels"],
        },
      },
    });

    const responseText = response.text || "";
    console.log('📄 腳本生成回應:', responseText);

    // 直接解析 JSON 回應，因為使用了 responseSchema 格式化輸出
    const scriptData = JSON.parse(responseText);
    
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

// 創建安全友好的提示詞
function createSafePrompt(originalPrompt: string): string {
  const safePrompt = originalPrompt
    .replace(/刀疤|傷痕|疤痕/g, '歷練的痕跡')
    .replace(/斷劍|破劍|劍刃|武器/g, '古老的器物')
    .replace(/血跡|血|鮮血/g, '紅色印記')
    .replace(/戰火|戰爭|戰鬥/g, '歷史事件')
    .replace(/廢墟|破壞|摧毀/g, '古老遺跡')
    .replace(/死亡|死去|屍體/g, '沉睡')
    .replace(/暴力|攻擊|殺戮/g, '決心')
    .replace(/憤怒|憤恨|怒火/g, '堅定')
    .replace(/痛苦|折磨|煎熬/g, '思考')
    .replace(/復仇|報復|仇恨/g, '正義');
  
  return safePrompt;
}

// 根據已優化的提示詞生成單個分鏡圖片
async function generatePanelImageWithPrompt(optimizedPrompt: string, script: PanelScript): Promise<string> {
  // 最多重試3次
  const maxRetries = 3;
  let lastError: Error | null = null;
  let imagePrompt = optimizedPrompt;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎨 開始生成分鏡 ${script.panelNumber} 圖片... (嘗試 ${attempt}/${maxRetries})`);
      
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
      
      // 檢查是否被安全過濾器阻擋
      if (!candidate.content) {
        const safetyReason = candidate.finishReason || "unknown";
        console.log(`⚠️ 分鏡 ${script.panelNumber} 可能被安全過濾器阻擋 (原因: ${safetyReason})`);
        
        if (attempt < maxRetries) {
          console.log(`🔄 嘗試使用更安全的提示詞重試...`);
          // 使用更安全的提示詞重試
          imagePrompt = createSafePrompt(imagePrompt);
          continue;
        } else {
          throw new Error(`內容被安全過濾器阻擋，已重試 ${maxRetries} 次`);
        }
      }
      
      if (!candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("候選結果內容中沒有部分");
      }
      
      // 提取生成的圖片數據
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const dataSize = Math.round(part.inlineData.data.length / 1024); // KB
          console.log(`✅ 分鏡 ${script.panelNumber} 生成成功 (${dataSize}KB, 嘗試 ${attempt})`);
          return part.inlineData.data; // 返回 base64 編碼的圖片
        }
      }
      
      throw new Error("未能在回應中找到圖片數據");
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ 分鏡 ${script.panelNumber} 第 ${attempt} 次嘗試失敗:`, lastError.message);
      
      // 如果是最後一次嘗試，不再重試
      if (attempt === maxRetries) {
        break;
      }
      
      // 如果是安全過濾問題，使用更安全的提示詞
      if (lastError.message.includes("候選結果中沒有內容") || 
          lastError.message.includes("安全過濾")) {
        console.log(`🔄 使用更安全的提示詞重試...`);
        imagePrompt = createSafePrompt(imagePrompt);
      }
      
      // 等待1秒後重試
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 所有重試都失敗了
  const errorMessage = lastError?.message || "未知錯誤";
  
  // 提供更具體的錯誤信息
  if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
    throw new Error(`API 配額不足或達到限制 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("not available") || errorMessage.includes("region")) {
    throw new Error(`圖片生成功能在此地區不可用 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("API key")) {
    throw new Error(`API Key 無效或未設定 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("安全過濾") || errorMessage.includes("候選結果中沒有內容")) {
    throw new Error(`分鏡 ${script.panelNumber} 內容被安全過濾器阻擋，請嘗試修改描述`);
  }
  
  throw new Error(`生成分鏡 ${script.panelNumber} 圖片失敗: ${errorMessage}`);
}

// 根據腳本生成單個分鏡圖片
async function generatePanelImage(script: PanelScript, style: ComicStyle): Promise<string> {
  // 使用 LLM 優化圖片生成提示詞
  let imagePrompt = await optimizeImagePrompt(script, style);
  
  // 最多重試3次
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎨 開始生成分鏡 ${script.panelNumber} 圖片... (嘗試 ${attempt}/${maxRetries})`);
      
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
      
      // 檢查是否被安全過濾器阻擋
      if (!candidate.content) {
        const safetyReason = candidate.finishReason || "unknown";
        console.log(`⚠️ 分鏡 ${script.panelNumber} 可能被安全過濾器阻擋 (原因: ${safetyReason})`);
        
        if (attempt < maxRetries) {
          console.log(`🔄 嘗試使用更安全的提示詞重試...`);
          // 使用更安全的提示詞重試
          imagePrompt = createSafePrompt(imagePrompt);
          continue;
        } else {
          throw new Error(`內容被安全過濾器阻擋，已重試 ${maxRetries} 次`);
        }
      }
      
      if (!candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("候選結果內容中沒有部分");
      }
      
      // 提取生成的圖片數據
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const dataSize = Math.round(part.inlineData.data.length / 1024); // KB
          console.log(`✅ 分鏡 ${script.panelNumber} 生成成功 (${dataSize}KB, 嘗試 ${attempt})`);
          return part.inlineData.data; // 返回 base64 編碼的圖片
        }
      }
      
      throw new Error("未能在回應中找到圖片數據");
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ 分鏡 ${script.panelNumber} 第 ${attempt} 次嘗試失敗:`, lastError.message);
      
      // 如果是最後一次嘗試，不再重試
      if (attempt === maxRetries) {
        break;
      }
      
      // 如果是安全過濾問題，使用更安全的提示詞
      if (lastError.message.includes("候選結果中沒有內容") || 
          lastError.message.includes("安全過濾")) {
        console.log(`🔄 使用更安全的提示詞重試...`);
        imagePrompt = createSafePrompt(imagePrompt);
      }
      
      // 等待1秒後重試
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 所有重試都失敗了
  const errorMessage = lastError?.message || "未知錯誤";
  
  // 提供更具體的錯誤信息
  if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
    throw new Error(`API 配額不足或達到限制 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("not available") || errorMessage.includes("region")) {
    throw new Error(`圖片生成功能在此地區不可用 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("API key")) {
    throw new Error(`API Key 無效或未設定 (分鏡 ${script.panelNumber})`);
  }
  if (errorMessage.includes("安全過濾") || errorMessage.includes("候選結果中沒有內容")) {
    throw new Error(`分鏡 ${script.panelNumber} 內容被安全過濾器阻擋，請嘗試修改描述`);
  }
  
  throw new Error(`生成分鏡 ${script.panelNumber} 圖片失敗: ${errorMessage}`);
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
    
    console.log(`🚀 開始並行生成 ${scripts.length} 張圖片...`);

    // 第二步：並行生成所有圖片
    try {
      // 首先並行優化所有提示詞
      console.log(`🔧 開始並行優化所有提示詞...`);
      const promptPromises = scripts.map(async (script, index) => {
        console.log(`🔧 正在優化分鏡 ${script.panelNumber} 的提示詞... (並行 ${index + 1}/${scripts.length})`);
        const optimizedPrompt = await optimizeImagePrompt(script, style);
        console.log(`✅ 分鏡 ${script.panelNumber} 提示詞優化完成`);
        return { script, optimizedPrompt };
      });

      const optimizedPrompts = await Promise.all(promptPromises);
      console.log(`✅ 所有提示詞優化完成，開始並行生成圖片...`);

      // 然後並行生成所有圖片
      const imagePromises = optimizedPrompts.map(async ({ script, optimizedPrompt }, index) => {
        try {
          console.log(`🎨 開始生成分鏡 ${script.panelNumber} (並行處理 ${index + 1}/${scripts.length})`);
          const image = await generatePanelImageWithPrompt(optimizedPrompt, script);
          console.log(`✅ 分鏡 ${script.panelNumber} 並行生成完成`);
          return { index: script.panelNumber - 1, image, success: true as const };
        } catch (error) {
          console.error(`❌ 並行生成分鏡 ${script.panelNumber} 失敗:`, error instanceof Error ? error.message : error);
          return { index: script.panelNumber - 1, error: error instanceof Error ? error.message : String(error), success: false as const };
        }
      });

      const results = await Promise.all(imagePromises);
      
      // 檢查是否有任何失敗的圖片生成
      const failedResults = results.filter(result => !result.success);
      if (failedResults.length > 0) {
        const errorMessage = `生成失敗的分鏡: ${failedResults.map(r => `分鏡${r.index + 1}(${r.error})`).join(', ')}`;
        console.error(`❌ 部分圖片生成失敗: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // 按順序排列圖片
      const images: string[] = new Array(scripts.length);
      results.forEach(result => {
        if (result.success) {
          images[result.index] = result.image;
        }
      });

      console.log(`🎉 並行漫畫創作完成！總共生成 ${images.length} 張圖片`);

      const response: GenerateComicResponse = {
        images,
        scripts,
        message: `成功創作 ${panelCount} 格漫畫，包含完整分鏡腳本 (優化並行處理)`
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error("❌ 並行生成圖片失敗:", error instanceof Error ? error.message : error);
      throw error;
    }

  } catch (error) {
    console.error("❌ 創作漫畫時發生錯誤:", error instanceof Error ? error.message : error);
    
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    
    return NextResponse.json(
      { error: `創作失敗: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
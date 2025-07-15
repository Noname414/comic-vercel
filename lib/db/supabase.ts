import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 上傳圖片到 Supabase Storage 並獲得 URL
export async function uploadImageToStorage(imageBase64: string, fileName: string): Promise<string> {
  try {
    // 將 base64 轉換為 Blob
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBlob = new Blob([Buffer.from(base64Data, 'base64')], { type: 'image/png' });
    
    // 上傳到 Supabase Storage
    const { error } = await supabase.storage
      .from('comic-images')  // 需要在 Supabase 中建立這個 bucket
      .upload(`panels/${fileName}`, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('上傳圖片失敗:', error);
      throw error;
    }

    // 獲得公開 URL
    const { data: urlData } = supabase.storage
      .from('comic-images')
      .getPublicUrl(`panels/${fileName}`);

    console.log(`✅ 圖片上傳成功: ${fileName} -> ${urlData.publicUrl}`);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ 上傳圖片到 Storage 失敗:', error);
    // 如果上傳失敗，回退到存 base64 資料
    return imageBase64;
  }
}

// 批量上傳圖片並獲得 URL
export async function uploadComicImages(
  images: string[], 
  comicId: string
): Promise<string[]> {
  const uploadPromises = images.map(async (image, index) => {
    const fileName = `comic-${comicId}-panel-${index + 1}-${Date.now()}.png`;
    return await uploadImageToStorage(image, fileName);
  });

  return await Promise.all(uploadPromises);
}

// 資料庫初始化函數 (在 Supabase 中，通常透過 Dashboard 或 SQL 編輯器建立資料表)
export async function initDatabase() {
  try {
    // 檢查 comics 資料表是否存在
    const { error: comicsError } = await supabase
      .from('comics')
      .select('id')
      .limit(1);

    if (comicsError && comicsError.code === 'PGRST116') {
      console.log('⚠️ 資料表不存在！');
      console.log('📋 請按照以下步驟在 Supabase 中建立資料表：');
      console.log('1. 登入您的 Supabase Dashboard');
      console.log('2. 前往 SQL Editor');
      console.log('3. 執行專案根目錄中的 supabase_tables.sql 檔案內容');
      console.log('4. 或者訪問：https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql');
      
      return {
        success: false,
        message: '資料表不存在，請先執行 supabase_tables.sql 腳本來建立資料表',
        instructions: {
          step1: '前往 Supabase Dashboard > SQL Editor',
          step2: '執行專案中的 supabase_tables.sql 檔案',
          step3: '重新測試此 API 端點'
        }
      };
    }

    // 檢查 Storage bucket 是否存在
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (!bucketsError) {
      const comicImagesBucket = buckets?.find(bucket => bucket.name === 'comic-images');
      if (!comicImagesBucket) {
        console.log('📁 建議建立 Storage bucket: comic-images');
        console.log('   前往 Supabase Dashboard > Storage > Create bucket');
        console.log('   Bucket 名稱: comic-images');
        console.log('   設為 Public bucket 以獲得公開 URL');
      }
    }

    console.log('✅ 資料庫連接正常');
    return {
      success: true,
      message: '資料庫初始化完成'
    };
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    throw error;
  }
}

// 儲存漫畫資料
export async function saveComic(data: {
  userPrompt: string;
  style: string;
  panelCount: number;
  panels: Array<{
    panelNumber: number;
    scriptText: string;
    scriptDescription?: string;
    imageUrl: string;
    imagePrompt?: string;
  }>;
}) {
  try {
    // 插入漫畫基本資料
    const { data: comic, error: comicError } = await supabase
      .from('comics')
      .insert({
        user_prompt: data.userPrompt,
        style: data.style,
        panel_count: data.panelCount
      })
      .select('id, created_at')
      .single();

    if (comicError) {
      throw comicError;
    }

    const comicId = comic.id;

    // 如果圖片是 base64 格式，嘗試上傳到 Storage
    const imageUrls = await Promise.all(
      data.panels.map(async (panel) => {
        if (panel.imageUrl.startsWith('data:image/') || !panel.imageUrl.startsWith('http')) {
          // 這是 base64 資料，嘗試上傳到 Storage
          const fileName = `comic-${comicId}-panel-${panel.panelNumber}-${Date.now()}.png`;
          return await uploadImageToStorage(panel.imageUrl, fileName);
        }
        // 這已經是 URL，直接使用
        return panel.imageUrl;
      })
    );

    // 批量插入面板資料
    const panelsData = data.panels.map((panel, index) => ({
      comic_id: comicId,
      panel_number: panel.panelNumber,
      script_text: panel.scriptText,
      script_description: panel.scriptDescription || null,
      image_url: imageUrls[index], // 使用 Storage URL 或原始資料
      image_prompt: panel.imagePrompt || null
    }));

    const { error: panelsError } = await supabase
      .from('comic_panels')
      .insert(panelsData);

    if (panelsError) {
      throw panelsError;
    }

    console.log(`✅ 漫畫已儲存到資料庫，ID: ${comicId}`);
    return {
      comicId,
      createdAt: comic.created_at
    };

  } catch (error) {
    console.error('❌ 儲存漫畫失敗:', error);
    throw error;
  }
}

// 取得漫畫資料
export async function getComic(comicId: number) {
  try {
    const { data: comic, error: comicError } = await supabase
      .from('comics')
      .select(`
        *,
        comic_panels (
          id,
          panel_number,
          script_text,
          script_description,
          image_url,
          image_prompt
        )
      `)
      .eq('id', comicId)
      .single();

    if (comicError) {
      throw comicError;
    }

    // 轉換面板資料格式以符合原本的結構
    if (comic && comic.comic_panels) {
      const panels = comic.comic_panels
        .sort((a: { panel_number: number }, b: { panel_number: number }) => a.panel_number - b.panel_number)
        .map((panel: {
          id: number;
          panel_number: number;
          script_text: string;
          script_description?: string;
          image_url: string;
          image_prompt?: string;
        }) => ({
          id: panel.id,
          panelNumber: panel.panel_number,
          scriptText: panel.script_text,
          scriptDescription: panel.script_description,
          imageUrl: panel.image_url,
          imagePrompt: panel.image_prompt
        }));

      return {
        ...comic,
        panels
      };
    }

    return comic;
  } catch (error) {
    console.error('❌ 取得漫畫失敗:', error);
    throw error;
  }
}

// 取得最近的漫畫列表
export async function getRecentComics(limit = 10) {
  try {
    const { data: comics, error } = await supabase
      .from('comics')
      .select('id, user_prompt, style, panel_count, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return comics || [];
  } catch (error) {
    console.error('❌ 取得漫畫列表失敗:', error);
    throw error;
  }
} 
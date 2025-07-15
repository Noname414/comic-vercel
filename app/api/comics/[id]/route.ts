import { NextRequest, NextResponse } from 'next/server';
import { getComic } from '@/lib/db/supabase';

// 取得單一漫畫詳細資料
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comicId = parseInt(id);
    
    if (isNaN(comicId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '無效的漫畫 ID' 
        },
        { status: 400 }
      );
    }

    const comic = await getComic(comicId);
    
    if (!comic) {
      return NextResponse.json(
        { 
          success: false, 
          error: '找不到指定的漫畫' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      comic
    });
  } catch (error) {
    console.error('取得漫畫詳細資料失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}
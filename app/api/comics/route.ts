import { NextRequest, NextResponse } from 'next/server';
import { getRecentComics } from '@/lib/db/supabase';

// 取得漫畫列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const comics = await getRecentComics(limit);
    
    return NextResponse.json({
      success: true,
      comics,
      total: comics.length
    });
  } catch (error) {
    console.error('取得漫畫列表失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/supabase';

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ 
      success: true, 
      message: '資料庫初始化完成' 
    });
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}
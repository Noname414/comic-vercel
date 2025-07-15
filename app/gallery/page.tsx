'use client';

import { useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useComics } from '@/lib/hooks/useComics';
import { ComicStyle } from '@/types/comic';

export default function Gallery() {
  const {
    comics,
    loading,
    error,
    stats,
    refreshComics,
    isValidImageUrl,
    hasCache
  } = useComics();

  const getStyleDisplayName = useCallback((style: ComicStyle): string => {
    const styleMap: Record<ComicStyle, string> = {
      manga: '少年漫畫',
      webtoon: '韓式漫畫',
      blackwhite: '黑白畫風',
      chibi: 'Q版',
      realistic: '寫實風格',
      watercolor: '水彩風格'
    };
    return styleMap[style] || style;
  }, []);

  // 使用 useMemo 優化渲染性能
  const comicCards = useMemo(() => {
    return comics.map((comic) => (
      <div key={comic.id} className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300 group">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{comic.user_prompt}</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {comic.panels.map((panel) => (
            <div key={panel.id} className="aspect-square overflow-hidden rounded-lg bg-white shadow-md relative">
              {isValidImageUrl(panel.image_url) ? (
                <Image
                  src={panel.image_url}
                  alt={`漫畫分鏡 ${panel.panel_number}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    console.error('圖片載入失敗:', panel.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <p className="text-sm">圖片無法載入</p>
                    <p className="text-xs">分鏡 {panel.panel_number}</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {panel.panel_number}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-600 space-y-2 mb-4">
          <p><strong>風格：</strong> {getStyleDisplayName(comic.style)}</p>
          <p><strong>分鏡數量：</strong> {comic.panel_count}</p>
          <p><strong>有效分鏡：</strong> {comic.panels.length}</p>
          <p><strong>創作時間：</strong> {new Date(comic.created_at).toLocaleDateString('zh-TW')}</p>
        </div>

        {/* 顯示部分分鏡腳本 */}
        {comic.panels.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">分鏡腳本預覽：</p>
            <p className="text-xs text-gray-600 line-clamp-3">
              {comic.panels[0].script_text}
            </p>
          </div>
        )}

        {/* 查看詳細按鈕 */}
        <div className="flex justify-center">
          <Link
            href={`/gallery/${comic.id}`}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 group-hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-medium">查看詳細</span>
          </Link>
        </div>
      </div>
    ));
  }, [comics, isValidImageUrl, getStyleDisplayName]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-12 px-4">
        <header className="text-center mb-16">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 text-purple-600 group-hover:text-purple-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">返回首頁</span>
            </Link>

            <div className="flex gap-2">
              {/* 緩存狀態指示 */}
              {hasCache && (
                <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  使用緩存
                </div>
              )}

              {/* 刷新按鈕 */}
              <button
                onClick={refreshComics}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm"
                title="刷新數據"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>

              <Link
                href="/"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">創作新漫畫</span>
              </Link>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-4 leading-tight">
            漫畫畫廊
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            瀏覽社群創作的漫畫作品。
          </p>

          {/* 統計信息 */}
          {stats.totalComics > 0 && (
            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                總共 {stats.totalComics} 個作品
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                {stats.totalPanels} 個分鏡
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                {stats.styles.length} 種風格
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-purple-500 hover:bg-purple-400 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在載入漫畫...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">錯誤</p>
              <p>{error}</p>
              <button
                onClick={refreshComics}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          </div>
        )}

        {!loading && !error && comics.length === 0 && (
          <div className="text-center">
            <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded mb-4">
              <p className="text-lg">目前還沒有漫畫作品。</p>
              <p className="text-sm mt-2">趕快去<Link href="/" className="text-blue-600 hover:text-blue-800 underline">創作您的第一個漫畫</Link>吧！</p>
            </div>
          </div>
        )}

        {!loading && !error && comics.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {comicCards}
          </div>
        )}
      </div>
    </main>
  );
}

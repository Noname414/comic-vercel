'use client';

import { useState, useEffect } from 'react';
import { ComicListItem, FullComicResponse } from '@/types/comic';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

export default function GalleryPage() {
  const [comics, setComics] = useState<ComicListItem[]>([]);
  const [selectedComic, setSelectedComic] = useState<FullComicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/comics?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setComics(data.comics);
      } else {
        setError(data.error || '獲取漫畫列表失敗');
      }
    } catch (err) {
      setError('網路錯誤');
      console.error('獲取漫畫列表錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComicDetails = async (comicId: number) => {
    try {
      setModalLoading(true);
      const response = await fetch(`/api/comics/${comicId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedComic(data.comic);
        setTotalImages(data.comic.panels?.length || 0);
        setLoadedImages(new Set());
      } else {
        setError(data.error || '獲取漫畫詳細資料失敗');
      }
    } catch (err) {
      setError('網路錯誤');
      console.error('獲取漫畫詳細資料錯誤:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleComicClick = (comic: ComicListItem) => {
    fetchComicDetails(comic.id);
  };

  const closeModal = () => {
    setSelectedComic(null);
    setLoadedImages(new Set());
    setTotalImages(0);
  };

  const getStyleDisplayName = (style: string) => {
    const styleMap: Record<string, string> = {
      'manga': '少年漫畫',
      'webtoon': '韓式漫畫', 
      'blackwhite': '黑白畫風',
      'chibi': 'Q版',
      'realistic': '寫實風格',
      'watercolor': '水彩風格'
    };
    return styleMap[style] || style;
  };

  const getStyleEmoji = (style: string) => {
    const emojiMap: Record<string, string> = {
      'manga': '📚',
      'webtoon': '🎨',
      'blackwhite': '🖋️',
      'chibi': '🥰',
      'realistic': '🎭',
      'watercolor': '🎨'
    };
    return emojiMap[style] || '🎨';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
        {/* 背景裝飾元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">載入畫廊中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
        {/* 背景裝飾元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30">
            <p className="text-red-600 mb-6 text-lg">{error}</p>
            <button 
              onClick={fetchComics}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              重新載入
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      {/* 背景裝飾元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* 導航 */}
      <Navigation />
      
      <div className="relative z-10 container mx-auto py-12 px-4">
        {/* 頁面標題 */}
        <header className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-4 leading-tight">
                漫畫畫廊
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg blur opacity-20"></div>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            探索所有使用 <span className="font-semibold text-purple-600">AI</span> 生成的精彩漫畫作品
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              共 {comics.length} 部作品
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse delay-300"></span>
              多樣化風格
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse delay-700"></span>
              一鍵檢視
            </div>
          </div>
        </header>

        {/* 畫廊內容 */}
        {comics.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-16">
            <div className="text-center">
              <div className="text-8xl mb-8 animate-bounce">🎨</div>
              <h2 className="text-3xl font-bold text-gray-700 mb-6">畫廊是空的</h2>
              <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">還沒有任何漫畫作品，快去創作第一個精彩的故事吧！</p>
              <Link 
                href="/"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
              >
                <span className="mr-3">🚀</span>
                開始創作
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">🖼️</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                作品集合
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comics.map((comic) => (
                <div
                  key={comic.id}
                  onClick={() => handleComicClick(comic)}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden border border-white/50 hover:scale-105"
                >
                  <div className="p-6">
                    {/* 標籤區域 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStyleEmoji(comic.style)}</span>
                        <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                          {getStyleDisplayName(comic.style)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {comic.panel_count} 分鏡
                      </span>
                    </div>
                    
                    {/* 內容標題 */}
                    <h3 className="font-bold text-lg text-gray-800 mb-4 group-hover:text-purple-600 transition-colors line-clamp-3 leading-relaxed">
                      {comic.user_prompt}
                    </h3>
                    
                    {/* 時間戳記 */}
                    <div className="text-sm text-gray-500 mb-6">
                      <span className="flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(comic.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* 分鏡預覽 */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(comic.panel_count, 6) }, (_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-sm shadow-sm"
                          />
                        ))}
                        {comic.panel_count > 6 && (
                          <span className="text-xs text-gray-500 ml-1">+{comic.panel_count - 6}</span>
                        )}
                      </div>
                      
                      {/* 檢視按鈕 */}
                      <div className="flex items-center text-sm text-purple-600 group-hover:text-purple-800 font-bold transition-colors">
                        <span className="mr-2">檢視作品</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 漫畫詳細檢視模態框 */}
        {selectedComic && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl max-w-6xl max-h-[95vh] overflow-auto w-full shadow-2xl border border-white/50">
              {/* 模態框標題 */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 p-8 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">{getStyleEmoji(selectedComic.style)}</span>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {selectedComic.user_prompt}
                      </h2>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                        <span className="mr-2">🎨</span>
                        {getStyleDisplayName(selectedComic.style)}
                      </div>
                      <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                        <span className="mr-2">📱</span>
                        {selectedComic.panel_count} 分鏡
                      </div>
                      <div className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full">
                        <span className="mr-2">📅</span>
                        {new Date(selectedComic.created_at).toLocaleDateString('zh-TW')}
                      </div>
                      {totalImages > 0 && (
                        <div className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
                          <span className="mr-2">📊</span>
                          載入進度: {loadedImages.size}/{totalImages}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={closeModal}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* 模態框內容 */}
              <div className="p-8">
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-gray-600 text-lg">載入漫畫中...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 漫畫分鏡網格 */}
                    <div className={`grid gap-6 ${
                      selectedComic.panel_count === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                      selectedComic.panel_count === 3 ? 'grid-cols-1 lg:grid-cols-3' :
                      selectedComic.panel_count === 4 ? 'grid-cols-1 md:grid-cols-2' :
                      selectedComic.panel_count === 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {selectedComic.panels?.map((panel) => (
                        <div key={panel.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                          {/* 分鏡標題 */}
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg text-gray-800">
                                分鏡 {panel.panelNumber}
                              </h3>
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{panel.panelNumber}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 分鏡內容 */}
                          <div className="p-6">
                            {/* 圖片 */}
                            {panel.imageUrl && panel.imageUrl.trim() !== '' ? (
                              <div className="relative mb-6">
                                <Image
                                  src={
                                    panel.imageUrl.startsWith('http') 
                                      ? panel.imageUrl  // Supabase Storage URL
                                      : panel.imageUrl.startsWith('data:') 
                                        ? panel.imageUrl  // Base64 with data prefix
                                        : `data:image/png;base64,${panel.imageUrl}`  // Raw base64
                                  }
                                  alt={`分鏡 ${panel.panelNumber}`}
                                  width={400}
                                  height={300}
                                  className="w-full h-64 object-cover rounded-xl shadow-md"
                                  unoptimized
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.fallback-image') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                <div className={`fallback-image w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center ${panel.imageUrl ? 'hidden' : 'flex'}`}>
                                  <div className="text-center">
                                    <span className="text-4xl mb-2 block">🖼️</span>
                                    <span className="text-gray-500">無圖片</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6">
                                <div className="text-center">
                                  <span className="text-4xl mb-2 block">🖼️</span>
                                  <span className="text-gray-500">無圖片</span>
                                </div>
                              </div>
                            )}
                            
                            {/* 腳本文字 */}
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center mb-2">
                                  <span className="text-sm mr-2">📝</span>
                                  <span className="font-medium text-gray-800 text-sm">場景描述</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {panel.scriptText}
                                </p>
                              </div>
                              
                              {panel.scriptDescription && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                  <div className="flex items-center mb-2">
                                    <span className="text-sm mr-2">💭</span>
                                    <span className="font-medium text-blue-800 text-sm">詳細描述</span>
                                  </div>
                                  <p className="text-blue-700 leading-relaxed">
                                    {panel.scriptDescription}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 返回首頁按鈕 */}
        <div className="mt-16 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
          >
            <span className="mr-3">🚀</span>
            創作新漫畫
          </Link>
        </div>
      </div>
    </main>
  );
}
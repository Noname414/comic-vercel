'use client';

import { useState } from 'react';
import { ComicStyle, GenerateComicResponse } from '@/types/comic';

// 風格選項
const styleOptions: { value: ComicStyle; label: string; emoji: string; desc: string }[] = [
  { value: 'manga', label: '少年漫畫', emoji: '📚', desc: '日式動漫風格' },
  { value: 'webtoon', label: '韓式漫畫', emoji: '🎨', desc: '韓式網路漫畫' },
  { value: 'blackwhite', label: '黑白畫風', emoji: '🖋️', desc: '經典黑白風格' },
  { value: 'chibi', label: 'Q 版', emoji: '🥰', desc: '可愛萌系風格' },
  { value: 'realistic', label: '寫實風格', emoji: '🎭', desc: '真實感畫風' },
  { value: 'watercolor', label: '水彩風格', emoji: '🎨', desc: '水彩藝術風格' },
];

export default function ComicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ComicStyle>('manga');
  const [panelCount, setPanelCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 將 base64 轉換為 blob 並下載
  const downloadImage = (base64Data: string, filename: string) => {
    try {
      // 移除 data URL 前綴（如果有的話）
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // 將 base64 轉換為 blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // 創建下載鏈接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 觸發下載
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載失敗，請稍後重試');
    }
  };

  // 下載單張圖片
  const handleDownloadSingle = (imageData: string, panelIndex: number) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `comic-panel-${panelIndex + 1}-${style}-${timestamp}.png`;
    downloadImage(imageData, filename);
  };

  // 批量下載所有圖片
  const handleDownloadAll = () => {
    if (images.length === 0) return;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    
    images.forEach((imageData, index) => {
      setTimeout(() => {
        const filename = `comic-panel-${index + 1}-${style}-${timestamp}.png`;
        downloadImage(imageData, filename);
      }, index * 500); // 每張圖片間隔 500ms 下載，避免瀏覽器阻擋
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('請輸入漫畫描述');
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);

    try {
      const response = await fetch('/api/generate-comic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          panelCount,
        }),
      });

      const data: GenerateComicResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失敗');
      }

      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 控制面板 */}
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            創作您的漫畫
          </h2>
        </div>
        
        {/* 描述輸入 */}
        <div className="mb-8">
          <label htmlFor="prompt" className="block text-lg font-semibold text-gray-700 mb-3">
            💭 描述您的故事
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一個年輕的魔法師在森林中遇到了一隻神秘的獨角獸..."
              className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 resize-none text-gray-700 placeholder-gray-500 transition-all duration-300 shadow-lg"
              rows={4}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {prompt.length}/500
            </div>
          </div>
        </div>

        {/* 風格選擇 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            🎨 選擇漫畫風格
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {styleOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setStyle(option.value)}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  style === option.value
                    ? 'border-purple-500 bg-purple-50/80 backdrop-blur-sm shadow-lg scale-105'
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-gray-800 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
                {style === option.value && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 分鏡數量選擇 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            📱 分鏡數量
          </label>
          <div className="flex gap-3">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setPanelCount(num)}
                className={`w-16 h-16 rounded-2xl border-2 font-bold text-lg transition-all duration-300 ${
                  panelCount === num
                    ? 'border-purple-500 bg-purple-500 text-white shadow-lg scale-110'
                    : 'border-gray-300 bg-white/70 text-gray-700 hover:border-purple-300 hover:scale-105'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 生成按鈕 */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
            loading || !prompt.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ✨ AI 正在創作中...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">🚀</span>
              開始生成漫畫
            </span>
          )}
        </button>

        {/* 錯誤提示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* 圖片展示區域 */}
      {images.length > 0 && (
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-xl">🎭</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                生成結果
              </h3>
            </div>
            
            {/* 批量下載按鈕 */}
            <button
              onClick={handleDownloadAll}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">📦</span>
              下載全部
            </button>
          </div>
          
          <div className={`grid gap-6 ${
            panelCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
            panelCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
            panelCount === 4 ? 'grid-cols-2' :
            panelCount === 5 ? 'grid-cols-2 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-2xl border-3 border-white/50 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
                  <img
                    src={`data:image/png;base64,${image}`}
                    alt={`漫畫分鏡 ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                
                {/* 單張下載按鈕 */}
                <button
                  onClick={() => handleDownloadSingle(image, index)}
                  className="absolute top-2 right-2 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white"
                  title={`下載分鏡 ${index + 1}`}
                >
                  <span className="text-lg">💾</span>
                </button>
                
                {/* 懸浮效果 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all duration-300"></div>
              </div>
            ))}
          </div>

          {/* 下載提示 */}
          <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">💡</span>
              <div className="text-blue-700">
                <p className="font-medium mb-1">下載說明：</p>
                <ul className="text-sm space-y-1">
                  <li>• 點擊右上角的 💾 圖標可下載單張圖片</li>
                  <li>• 點擊「下載全部」可批量下載所有分鏡</li>
                  <li>• 下載的檔案會自動命名，包含分鏡編號和風格</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading 狀態的美化佔位圖 */}
      {loading && (
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-xl animate-spin">⚡</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              AI 正在創作中...
            </h3>
          </div>
          <div className={`grid gap-6 ${
            panelCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
            panelCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
            panelCount === 4 ? 'grid-cols-2' :
            panelCount === 5 ? 'grid-cols-2 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {Array(panelCount).fill(0).map((_, index) => (
              <div key={index} className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 animate-pulse shadow-lg">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`text-4xl animate-bounce ${index === 1 ? 'delay-200' : index === 2 ? 'delay-500' : index === 3 ? 'delay-700' : index === 4 ? 'delay-1000' : ''}`}>
                      {['🎨', '✨', '🚀', '🎭', '🌟', '💫'][index]}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
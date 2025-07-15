import type { PanelScript } from '@/types/comic';
import DownloadButtons from './DownloadButtons';

interface ComicResultsProps {
  images: string[];
  scripts: PanelScript[];
  loading: boolean;
  error: string | null;
  isDownloading: boolean;
  onDownloadSingle: (imageData: string, panelIndex: number) => void;
  onDownloadAll: () => void;
}

export default function ComicResults({
  images,
  scripts,
  loading,
  error,
  isDownloading,
  onDownloadSingle,
  onDownloadAll,
}: ComicResultsProps) {
  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-12">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-700">AI 正在創作您的漫畫</h3>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <span>請耐心等待，這可能需要幾分鐘</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😥</div>
          <h3 className="text-2xl font-bold text-red-600 mb-4">創作過程中發生錯誤</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="text-sm text-gray-500">
            <p>請檢查：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>網路連線是否正常</li>
              <li>描述內容是否適當</li>
              <li>稍後再試一次</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            您的漫畫創作完成！
          </h3>
        </div>
        
        <DownloadButtons
          images={images}
          isDownloading={isDownloading}
          onDownloadAll={onDownloadAll}
        />
      </div>

      {/* 漫畫面板網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative bg-white/80 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/50"
          >
            {/* 面板標題 */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                第 {index + 1} 格
              </div>
            </div>

            {/* 下載單張按鈕 */}
            <button
              onClick={() => onDownloadSingle(image, index)}
              disabled={isDownloading}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 backdrop-blur-sm text-white rounded-full hover:bg-black/90 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-sm">💾</span>
              )}
            </button>

            {/* 圖片 */}
            <div className="relative aspect-square bg-gray-100">
              {image && image.length > 10 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={`漫畫分鏡 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  loading={index < 2 ? "eager" : "lazy"}
                  onError={(e) => {
                    console.error(`🚫 圖片 ${index + 1} 載入失敗`);
                    const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                    if (errorDiv) {
                      errorDiv.classList.remove('hidden');
                    }
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log(`✅ 圖片 ${index + 1} 載入成功`);
                  }}
                />
              ) : null}
              
              {/* 錯誤或載入中的占位符 */}
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg ${
                  !image || image.length <= 10 ? '' : 'hidden'
                }`}
              >
                <div className="text-center text-gray-500">
                  {!image || image.length <= 10 ? (
                    <>
                      <div className="text-3xl mb-2">🖼️</div>
                      <div className="text-sm">圖片載入中...</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">⚠️</div>
                      <div className="text-sm">圖片載入失敗</div>
                      <div className="text-xs mt-1">請重新生成</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 腳本信息 */}
            {scripts[index] && (
              <div className="p-4 bg-gradient-to-t from-white to-white/95">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    📝 場景描述
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {scripts[index].description}
                  </p>
                  
                  {scripts[index].dialogue && (
                    <div className="mt-3">
                      <div className="text-sm font-semibold text-gray-700">
                        💬 對話
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        &ldquo;{scripts[index].dialogue}&rdquo;
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-gray-700">
                      🎭 情境氛圍
                    </div>
                    <p className="text-sm text-gray-600">
                      {scripts[index].mood}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 使用提示 */}
      <div className="mt-8 p-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-500 text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">使用提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 點擊圖片右上角的按鈕可下載單張圖片</li>
              <li>• 使用「下載全部」可一次下載所有圖片</li>
              <li>• 圖片將以 PNG 格式保存到您的下載資料夾</li>
              <li>• 您可以重新調整參數來創作不同風格的漫畫</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
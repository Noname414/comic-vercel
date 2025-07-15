interface DownloadButtonsProps {
  images: string[];
  isDownloading: boolean;
  onDownloadAll: () => void;
}

export default function DownloadButtons({
  images,
  isDownloading,
  onDownloadAll,
}: DownloadButtonsProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      {/* 圖片數量顯示 */}
      <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>{images.length} 張圖片已生成</span>
      </div>

      {/* 下載全部按鈕 */}
      <button
        onClick={onDownloadAll}
        disabled={isDownloading}
        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
          isDownloading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
        }`}
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>下載中...</span>
          </>
        ) : (
          <>
            <span>📦</span>
            <span>下載全部</span>
          </>
        )}
      </button>
    </div>
  );
}
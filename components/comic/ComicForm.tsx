import type { ComicStyle } from '@/types/comic';

interface ComicFormProps {
  prompt: string;
  style: ComicStyle;
  panelCount: number;
  loading: boolean;
  retryAttempt?: number;
  maxRetryAttempts?: number;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: ComicStyle) => void;
  onPanelCountChange: (count: number) => void;
  onGenerate: () => void;
}

export default function ComicForm({
  prompt,
  style,
  panelCount,
  loading,
  retryAttempt = 0,
  maxRetryAttempts = 0,
  onPromptChange,
  onStyleChange,
  onPanelCountChange,
  onGenerate,
}: ComicFormProps) {
  const styleOptions: { value: ComicStyle; label: string; emoji: string }[] = [
    { value: 'manga', label: '少年漫畫', emoji: '📚' },
    { value: 'webtoon', label: '韓式漫畫', emoji: '🎨' },
    { value: 'blackwhite', label: '黑白畫風', emoji: '⚫' },
    { value: 'chibi', label: 'Q版可愛', emoji: '🤗' },
    { value: 'realistic', label: '寫實風格', emoji: '🎭' },
    { value: 'watercolor', label: '水彩風格', emoji: '🌈' },
  ];

  const panelOptions = [2, 3, 4, 5, 6];

  return (
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
          💭 描述您的故事概念
        </label>
        <div className="relative">
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="例如：一個小女孩在魔法森林中遇到了會說話的動物朋友們，一起踏上冒險之旅..."
            className="w-full h-32 px-6 py-4 text-gray-800 border-2 border-transparent bg-white/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 resize-none text-lg leading-relaxed shadow-lg"
            disabled={loading}
          />
          <div className="absolute bottom-4 right-4 text-sm text-gray-500">
            {prompt.length}/500 字
          </div>
        </div>
      </div>

      {/* 風格選擇 */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          🎨 選擇風格
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStyleChange(option.value)}
              disabled={loading}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                style === option.value
                  ? 'border-purple-500 bg-purple-100/80 shadow-lg'
                  : 'border-gray-200 bg-white/60 hover:border-purple-300 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {option.emoji}
                </span>
                <span className={`font-semibold ${
                  style === option.value ? 'text-purple-700' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 分鏡數量選擇 */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          📐 分鏡數量
        </label>
        <div className="flex flex-wrap gap-3">
          {panelOptions.map((num) => (
            <button
              key={num}
              onClick={() => onPanelCountChange(num)}
              disabled={loading}
              className={`px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-300 hover:scale-105 ${
                panelCount === num
                  ? 'border-blue-500 bg-blue-100/80 text-blue-700 shadow-lg'
                  : 'border-gray-200 bg-white/60 text-gray-700 hover:border-blue-300'
              }`}
            >
              {num} 格
            </button>
          ))}
        </div>
      </div>

      {/* 生成按鈕 */}
      <button
        onClick={onGenerate}
        disabled={loading || !prompt.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
          loading || !prompt.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
        }`}
      >
{loading ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>
              {retryAttempt > 0 
                ? `重試中... (${retryAttempt}/${maxRetryAttempts})`
                : '創作中...'
              }
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <span>🚀</span>
            <span>開始創作漫畫</span>
          </div>
        )}
      </button>
    </div>
  );
}
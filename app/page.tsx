import ComicGenerator from '@/components/ComicGenerator';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      {/* 背景裝飾元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto py-12 px-4">
        {/* 網站標題區域 */}
        <header className="text-center mb-16">
          <nav className="flex justify-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center px-6 py-3 bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 text-gray-700 font-medium hover:bg-white/40 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              首頁
            </Link>
            <Link
              href="/gallery"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              瀏覽畫廊
            </Link>
          </nav>
          <div className="inline-block mb-6">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-4 leading-tight">
                AI 漫畫生成器
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg blur opacity-20"></div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            使用 <span className="font-semibold text-purple-600">Gemini AI</span> 將您的想法轉換成精美的漫畫分鏡
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              智能分鏡生成
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse delay-300"></span>
              多種風格選擇
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse delay-700"></span>
              即時生成預覽
            </div>
          </div>
        </header>

        {/* 漫畫生成器 */}
        <ComicGenerator />

        {/* 頁腳 */}
        <footer className="mt-20 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-gray-500 bg-white/40 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
            <span className="text-sm">Powered by</span>
            <span className="font-semibold text-purple-600">Gemini AI</span>
            <span className="text-sm">&</span>
            <span className="font-semibold text-blue-600">Next.js</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useComics } from '@/lib/hooks/useComics';
import { ComicStyle } from '@/types/comic';

interface ComicPanel {
    id: number;
    comic_id: number;
    panel_number: number;
    script_text: string;
    script_description: string | null;
    image_url: string;
    image_prompt: string;
    created_at: string;
}

interface Comic {
    id: number;
    user_prompt: string;
    style: ComicStyle;
    panel_count: number;
    created_at: string;
    updated_at: string;
    panels: ComicPanel[];
}

export default function ComicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getComicById, loading, error, isValidImageUrl } = useComics();
    const [comic, setComic] = useState<Comic | null>(null);
    const [localLoading, setLocalLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);

    const comicId = parseInt(params.id as string);

    const getStyleDisplayName = (style: ComicStyle): string => {
        const styleMap: Record<ComicStyle, string> = {
            manga: '少年漫畫',
            webtoon: '韓式漫畫',
            blackwhite: '黑白畫風',
            chibi: 'Q版',
            realistic: '寫實風格',
            watercolor: '水彩風格'
        };
        return styleMap[style] || style;
    };

    useEffect(() => {
        if (isNaN(comicId)) {
            setLocalError('無效的漫畫 ID');
            setLocalLoading(false);
            return;
        }

        // 首先嘗試從緩存中獲取
        const cachedComic = getComicById(comicId);
        if (cachedComic) {
            console.log('📦 使用緩存的漫畫詳細數據');
            setComic(cachedComic);
            setLocalLoading(false);
            return;
        }

        // 如果緩存中沒有，等待全局數據載入完成
        if (!loading) {
            const globalComic = getComicById(comicId);
            if (globalComic) {
                setComic(globalComic);
            } else {
                setLocalError('找不到指定的漫畫');
            }
            setLocalLoading(false);
        }
    }, [comicId, getComicById, loading]);

    // 決定最終的載入狀態
    const isLoading = localLoading || (loading && !comic);
    const finalError = localError || error;

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
                <div className="relative z-10 container mx-auto py-12 px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-purple-500 hover:bg-purple-400 transition ease-in-out duration-150 cursor-not-allowed">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            正在載入漫畫詳細信息...
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (finalError || !comic) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
                <div className="relative z-10 container mx-auto py-12 px-4">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p className="font-bold">錯誤</p>
                            <p>{finalError || '漫畫不存在'}</p>
                        </div>
                        <Link
                            href="/gallery"
                            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            返回畫廊
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
            <div className="relative z-10 container mx-auto py-12 px-4">
                {/* 頁面標題和導航 */}
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href="/gallery"
                            className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-all duration-300 group"
                        >
                            <svg className="w-5 h-5 mr-2 text-purple-600 group-hover:text-purple-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">返回畫廊</span>
                        </Link>
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

                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-4 leading-tight">
                            漫畫詳細頁面
                        </h1>
                        <p className="text-xl text-gray-700 mb-4">{comic.user_prompt}</p>
                        <div className="flex justify-center gap-4 text-sm text-gray-600">
                            <span className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                                風格：{getStyleDisplayName(comic.style)}
                            </span>
                            <span className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                                分鏡：{comic.panel_count} 格
                            </span>
                            <span className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                                創作時間：{new Date(comic.created_at).toLocaleDateString('zh-TW')}
                            </span>
                        </div>
                    </div>
                </header>

                {/* 漫畫分鏡展示 */}
                <div className="space-y-12">
                    {comic.panels.map((panel, index) => (
                        <div key={panel.id} className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                                    <span className="text-white font-bold text-lg">{panel.panel_number}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">分鏡 {panel.panel_number}</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* 圖片 */}
                                <div className="space-y-4">
                                    <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-xl">
                                        {isValidImageUrl(panel.image_url) ? (
                                            <Image
                                                src={panel.image_url}
                                                alt={`漫畫分鏡 ${panel.panel_number}`}
                                                width={500}
                                                height={500}
                                                className="w-full h-full object-cover"
                                                priority={index < 2}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <div className="text-gray-500 text-center">
                                                    <p className="text-lg">圖片無法載入</p>
                                                    <p className="text-sm">分鏡 {panel.panel_number}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                                            情緒氛圍：{panel.image_prompt}
                                        </span>
                                    </div>
                                </div>

                                {/* 文字內容 */}
                                <div className="space-y-6">
                                    {/* 場景描述 */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            場景描述
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-base">
                                            {panel.script_text}
                                        </p>
                                    </div>

                                    {/* 對話內容 */}
                                    {panel.script_description && (
                                        <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-l-4 border-blue-400">
                                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                對話內容
                                            </h3>
                                            <p className="text-blue-700 leading-relaxed text-base font-medium">
                                                "{panel.script_description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 底部導航 */}
                <div className="mt-16 text-center">
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/gallery"
                            className="flex items-center px-8 py-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-all duration-300 group"
                        >
                            <svg className="w-5 h-5 mr-2 text-purple-600 group-hover:text-purple-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">瀏覽更多作品</span>
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="font-medium">創作我的漫畫</span>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
} 
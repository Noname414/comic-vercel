import { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
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

// 驗證圖片 URL 是否有效
const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'https:' && url.includes('supabase.co');
    } catch {
        return false;
    }
};

// 緩存鍵
const CACHE_KEY = 'comics-gallery-cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 分鐘

// 從 localStorage 獲取緩存
const getCachedComics = (): Comic[] | null => {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                return data;
            }
        }
    } catch (error) {
        console.error('獲取緩存失敗:', error);
    }
    return null;
};

// 存儲到 localStorage
const setCachedComics = (comics: Comic[]) => {
    if (typeof window === 'undefined') return;

    try {
        const cacheData = {
            data: comics,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('存儲緩存失敗:', error);
    }
};

// 數據獲取器
const fetcher = async (): Promise<Comic[]> => {
    try {
        console.log('🔄 從 Supabase 獲取漫畫數據...');

        // 先獲取漫畫基本信息
        const { data: comicsData, error: comicsError } = await supabase
            .from('comics')
            .select('*')
            .order('created_at', { ascending: false });

        if (comicsError) {
            throw comicsError;
        }

        if (!comicsData || comicsData.length === 0) {
            return [];
        }

        // 獲取每個漫畫的分鏡信息
        const comicsWithPanels = await Promise.all(
            comicsData.map(async (comic) => {
                const { data: panelsData, error: panelsError } = await supabase
                    .from('comic_panels')
                    .select('*')
                    .eq('comic_id', comic.id)
                    .order('panel_number', { ascending: true });

                if (panelsError) {
                    console.error(`獲取漫畫 ${comic.id} 的分鏡失敗:`, panelsError);
                    return { ...comic, panels: [] };
                }

                // 過濾出有效的分鏡（有有效圖片 URL 的）
                const validPanels = (panelsData || []).filter(panel => {
                    const isValid = isValidImageUrl(panel.image_url);
                    if (!isValid) {
                        console.warn(`分鏡 ${panel.id} 的圖片 URL 無效:`, panel.image_url);
                    }
                    return isValid;
                });

                return { ...comic, panels: validPanels };
            })
        );

        // 過濾掉沒有分鏡的漫畫
        const validComics = comicsWithPanels.filter(comic =>
            comic.panels && comic.panels.length > 0
        );

        // 存儲到緩存
        setCachedComics(validComics);

        console.log(`✅ 成功獲取 ${validComics.length} 個漫畫`);
        return validComics;

    } catch (error) {
        console.error('獲取漫畫數據失敗:', error);
        throw error;
    }
};

export const useComics = () => {
    const [initialData, setInitialData] = useState<Comic[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // 在客戶端初始化時檢查緩存
    useEffect(() => {
        if (typeof window !== 'undefined' && !hasInitialized) {
            const cached = getCachedComics();
            if (cached) {
                console.log('📦 使用緩存的漫畫數據');
                setInitialData(cached);
            }
            setHasInitialized(true);
        }
    }, [hasInitialized]);

    // 使用 SWR 進行數據獲取和緩存
    const { data, error, isLoading, mutate } = useSWR<Comic[]>(
        'comics-gallery',
        fetcher,
        {
            fallbackData: initialData,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 30000, // 30秒內不重複請求
            errorRetryCount: 3,
            onSuccess: (data) => {
                console.log('🔄 SWR 數據更新完成');
                setCachedComics(data);
            },
            onError: (error) => {
                console.error('SWR 獲取數據失敗:', error);
            }
        }
    );

    // 刷新數據的函數
    const refreshComics = useCallback(() => {
        console.log('🔄 手動刷新漫畫數據...');
        mutate();
    }, [mutate]);

    // 清除緩存的函數
    const clearCache = useCallback(() => {
        console.log('🗑️ 清除漫畫緩存...');
        localStorage.removeItem(CACHE_KEY);
        mutate();
    }, [mutate]);

    // 獲取單個漫畫的函數
    const getComicById = useCallback((id: number): Comic | undefined => {
        return data?.find(comic => comic.id === id);
    }, [data]);

    // 預載入圖片
    const preloadImages = useCallback((comics: Comic[]) => {
        if (typeof window === 'undefined') return;

        comics.forEach(comic => {
            comic.panels.forEach(panel => {
                if (isValidImageUrl(panel.image_url)) {
                    const img = new Image();
                    img.src = panel.image_url;
                }
            });
        });
    }, []);

    // 當數據變化時預載入圖片
    useEffect(() => {
        if (data && data.length > 0) {
            preloadImages(data);
        }
    }, [data, preloadImages]);

    // 計算統計信息
    const stats = useMemo(() => {
        if (!data) return { totalComics: 0, totalPanels: 0, styles: [] };

        const totalComics = data.length;
        const totalPanels = data.reduce((sum, comic) => sum + comic.panels.length, 0);
        const styles = [...new Set(data.map(comic => comic.style))];

        return { totalComics, totalPanels, styles };
    }, [data]);

    return {
        comics: data || [],
        loading: isLoading && initialData.length === 0,
        error,
        stats,
        refreshComics,
        clearCache,
        getComicById,
        // 輔助函數
        isValidImageUrl,
        hasCache: initialData.length > 0,
    };
}; 
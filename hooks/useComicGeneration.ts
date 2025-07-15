import { useState } from 'react';
import type { ComicStyle, PanelScript, GenerateComicResponseWithDB } from '@/types/comic';
import { generateComic as apiGenerateComic } from '@/utils/apiClient';
import { getFriendlyErrorMessage } from '@/utils/errorHandler';

interface UseComicGenerationReturn {
  // 狀態
  prompt: string;
  style: ComicStyle;
  panelCount: number;
  loading: boolean;
  images: string[];
  scripts: PanelScript[];
  error: string | null;
  retryAttempt: number;
  maxRetryAttempts: number;

  // 操作函數
  setPrompt: (prompt: string) => void;
  setStyle: (style: ComicStyle) => void;
  setPanelCount: (count: number) => void;
  generateComic: () => Promise<void>;
  resetState: () => void;
}

export function useComicGeneration(): UseComicGenerationReturn {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ComicStyle>('manga');
  const [panelCount, setPanelCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [scripts, setScripts] = useState<PanelScript[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [maxRetryAttempts] = useState(2);

  const generateComic = async () => {
    setLoading(true);
    setError(null);
    setImages([]);
    setScripts([]);
    setRetryAttempt(0);

    try {
      const data = await apiGenerateComic(
        { prompt, style, panelCount },
        (attempt, maxAttempts, error) => {
          setRetryAttempt(attempt);
          if (error) {
            console.log(`重試第 ${attempt} 次，共 ${maxAttempts} 次`);
          }
        }
      );

      // 調試信息
      console.log(`📊 API 響應: ${data.images?.length || 0} 張圖片, ${data.scripts?.length || 0} 個腳本`);

      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          if (image) {
            console.log(`🖼️ 圖片 ${index + 1}: ${image.substring(0, 30)}...`);
          } else {
            console.warn(`⚠️ 圖片 ${index + 1} 為空`);
          }
        });
      }

      setImages(data.images || []);
      setScripts(data.scripts || []);
      setRetryAttempt(0);
    } catch (err) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      setRetryAttempt(0);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setPrompt('');
    setStyle('manga');
    setPanelCount(4);
    setLoading(false);
    setImages([]);
    setScripts([]);
    setError(null);
    setRetryAttempt(0);
  };

  return {
    // 狀態
    prompt,
    style,
    panelCount,
    loading,
    images,
    scripts,
    error,
    retryAttempt,
    maxRetryAttempts,

    // 操作函數
    setPrompt,
    setStyle,
    setPanelCount,
    generateComic,
    resetState,
  };
}
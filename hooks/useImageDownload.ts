import { useState } from 'react';
import type { ComicStyle } from '@/types/comic';

interface UseImageDownloadReturn {
  isDownloading: boolean;
  downloadSingle: (imageData: string, panelIndex: number, style: ComicStyle) => Promise<void>;
  downloadAll: (images: string[], style: ComicStyle) => Promise<void>;
}

export function useImageDownload(): UseImageDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async (imageData: string, filename: string): Promise<void> => {
    try {
      if (imageData.startsWith('http')) {
        // 處理 URL 圖片
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      } else {
        // 處理 base64 圖片
        const base64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('下載失敗:', error);
      throw new Error('下載失敗，請稍後重試');
    }
  };

  const downloadSingle = async (imageData: string, panelIndex: number, style: ComicStyle): Promise<void> => {
    setIsDownloading(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `comic-panel-${panelIndex + 1}-${style}-${timestamp}.png`;
      await downloadImage(imageData, filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAll = async (images: string[], style: ComicStyle): Promise<void> => {
    if (images.length === 0) return;
    
    setIsDownloading(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      
      for (let index = 0; index < images.length; index++) {
        try {
          const filename = `comic-panel-${index + 1}-${style}-${timestamp}.png`;
          await downloadImage(images[index], filename);
          // 每張圖片間隔 500ms 下載，避免瀏覽器阻擋
          if (index < images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`下載第 ${index + 1} 張圖片失敗:`, error);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadSingle,
    downloadAll,
  };
}
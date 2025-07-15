'use client';

import { useComicGeneration } from '@/hooks/useComicGeneration';
import { useImageDownload } from '@/hooks/useImageDownload';
import ComicForm from './comic/ComicForm';
import ComicResults from './comic/ComicResults';

export default function ComicGenerator() {
  const {
    prompt,
    style,
    panelCount,
    loading,
    images,
    scripts,
    error,
    retryAttempt,
    maxRetryAttempts,
    setPrompt,
    setStyle,
    setPanelCount,
    generateComic,
  } = useComicGeneration();

  const {
    isDownloading,
    downloadSingle,
    downloadAll,
  } = useImageDownload();

  const handleDownloadSingle = async (imageData: string, panelIndex: number) => {
    try {
      await downloadSingle(imageData, panelIndex, style);
    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載失敗，請稍後重試');
    }
  };

  const handleDownloadAll = async () => {
    try {
      await downloadAll(images, style);
    } catch (error) {
      console.error('批量下載失敗:', error);
      alert('下載失敗，請稍後重試');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <ComicForm
        prompt={prompt}
        style={style}
        panelCount={panelCount}
        loading={loading}
        retryAttempt={retryAttempt}
        maxRetryAttempts={maxRetryAttempts}
        onPromptChange={setPrompt}
        onStyleChange={setStyle}
        onPanelCountChange={setPanelCount}
        onGenerate={generateComic}
      />

      <ComicResults
        images={images}
        scripts={scripts}
        loading={loading}
        error={error}
        isDownloading={isDownloading}
        onDownloadSingle={handleDownloadSingle}
        onDownloadAll={handleDownloadAll}
      />
    </div>
  );
}
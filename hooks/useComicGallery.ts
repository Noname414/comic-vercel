import { useState, useEffect } from 'react';
import type { ComicListItem, FullComicResponse } from '@/types/comic';
import { getComics, getComicDetails } from '@/utils/apiClient';
import { getFriendlyErrorMessage } from '@/utils/errorHandler';

interface UseComicGalleryReturn {
  comics: ComicListItem[];
  selectedComic: FullComicResponse | null;
  loading: boolean;
  modalLoading: boolean;
  error: string | null;
  loadedImages: Set<number>;
  totalImages: number;
  
  fetchComics: () => Promise<void>;
  fetchComicDetails: (comicId: number) => Promise<void>;
  selectComic: (comic: ComicListItem) => void;
  closeModal: () => void;
  onImageLoad: (imageId: number) => void;
}

export function useComicGallery(): UseComicGalleryReturn {
  const [comics, setComics] = useState<ComicListItem[]>([]);
  const [selectedComic, setSelectedComic] = useState<FullComicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchComics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getComics(50);
      setComics(data.comics);
    } catch (err) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchComicDetails = async (comicId: number) => {
    try {
      setModalLoading(true);
      setError(null);
      
      const data = await getComicDetails(comicId);
      setSelectedComic(data.comic);
      setTotalImages(data.comic.panels?.length || 0);
      setLoadedImages(new Set());
    } catch (err) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const selectComic = (comic: ComicListItem) => {
    fetchComicDetails(comic.id);
  };

  const closeModal = () => {
    setSelectedComic(null);
    setLoadedImages(new Set());
    setTotalImages(0);
  };

  const onImageLoad = (imageId: number) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  // 初始載入
  useEffect(() => {
    fetchComics();
  }, []);

  return {
    comics,
    selectedComic,
    loading,
    modalLoading,
    error,
    loadedImages,
    totalImages,
    
    fetchComics,
    fetchComicDetails,
    selectComic,
    closeModal,
    onImageLoad,
  };
}
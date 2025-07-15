import { createRetryFetch, withRetryProgress } from './retryUtils';
import { APIError, ValidationError, withErrorHandling } from './errorHandler';
import {
  safeValidate,
  GenerateComicRequestSchema,
  GenerateComicResponseSchema
} from './validation';
import type { GenerateComicRequest, GenerateComicResponse, GenerateComicResponseWithDB } from '@/types/comic';

/**
 * API 客戶端配置
 */
const retryFetch = createRetryFetch({
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffMultiplier: 2,
});

/**
 * 驗證漫畫生成請求
 */
function validateGenerateComicRequest(request: unknown): GenerateComicRequest {
  return safeValidate(GenerateComicRequestSchema, request, '漫畫生成請求');
}

/**
 * 生成漫畫 API 調用
 */
export const generateComic = withErrorHandling(
  async (
    request: GenerateComicRequest,
    onProgress?: (attempt: number, maxAttempts: number, error?: unknown) => void
  ): Promise<GenerateComicResponseWithDB> => {
    // 驗證請求
    const validatedRequest = validateGenerateComicRequest(request);

    return withRetryProgress(
      async () => {
        const response = await retryFetch('/api/generate-comic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedRequest),
        });

        const rawData = await response.json();

        // 基本檢查而不是嚴格驗證，避免類型問題
        if (rawData && typeof rawData === 'object' && rawData.error) {
          throw new APIError(rawData.error, response.status);
        }

        // 確保必要的欄位存在，但不強制驗證所有欄位
        const data: GenerateComicResponseWithDB = {
          images: Array.isArray(rawData.images) ? rawData.images : [],
          scripts: Array.isArray(rawData.scripts) ? rawData.scripts : [],
          message: rawData.message,
          error: rawData.error,
          ...(rawData.comicId && { comicId: rawData.comicId }),
          ...(rawData.createdAt && { createdAt: new Date(rawData.createdAt) }),
        };

        return data;
      },
      onProgress,
      {
        maxAttempts: 2, // 對於漫畫生成，減少重試次數避免過長等待
        baseDelay: 2000,
      }
    );
  },
  '漫畫生成'
);

/**
 * 獲取漫畫列表
 */
export const getComics = withErrorHandling(
  async (limit: number = 50): Promise<any> => {
    const response = await retryFetch(`/api/comics?limit=${limit}`);
    const data = await response.json();

    if (!data.success) {
      throw new APIError(data.error || '獲取漫畫列表失敗', response.status);
    }

    return data;
  },
  '獲取漫畫列表'
);

/**
 * 獲取漫畫詳情
 */
export const getComicDetails = withErrorHandling(
  async (comicId: number): Promise<any> => {
    if (!comicId || comicId <= 0) {
      throw new ValidationError('無效的漫畫 ID');
    }

    const response = await retryFetch(`/api/comics/${comicId}`);
    const data = await response.json();

    if (!data.success) {
      throw new APIError(data.error || '獲取漫畫詳情失敗', response.status);
    }

    return data;
  },
  '獲取漫畫詳情'
);

/**
 * 通用 API 錯誤處理包裝器
 */
export function createApiCall<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  context: string
) {
  return withErrorHandling(apiFunction, context);
}
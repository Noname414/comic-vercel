import { APIError, NetworkError, logError } from './errorHandler';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // 毫秒
  maxDelay?: number; // 毫秒
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // 默認重試條件：網路錯誤或 5xx 服務器錯誤
    if (error instanceof NetworkError) return true;
    if (error instanceof APIError) {
      return error.status ? error.status >= 500 : true;
    }
    return false;
  },
  onRetry: () => {},
};

/**
 * 延遲函數
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 計算指數退避延遲
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  // 添加隨機抖動，避免多個請求同時重試
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, options.maxDelay);
}

/**
 * 重試裝飾器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 記錄錯誤
      logError(error, `重試嘗試 ${attempt}/${opts.maxAttempts}`);
      
      // 檢查是否應該重試
      if (attempt === opts.maxAttempts || !opts.retryCondition(error)) {
        throw error;
      }
      
      // 調用重試回調
      opts.onRetry(attempt, error);
      
      // 等待後重試
      const delayMs = calculateDelay(attempt, opts);
      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * 創建具有重試功能的 fetch 函數
 */
export function createRetryFetch(options: RetryOptions = {}) {
  return async function retryFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    return withRetry(async () => {
      try {
        const response = await fetch(input, init);
        
        // 檢查響應狀態
        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        
        return response;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('網路連線失敗');
        }
        throw error;
      }
    }, options);
  };
}

/**
 * 帶進度回調的重試函數
 */
export async function withRetryProgress<T>(
  fn: () => Promise<T>,
  onProgress?: (attempt: number, maxAttempts: number, error?: unknown) => void,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  
  return withRetry(fn, {
    ...opts,
    onRetry: (attempt, error) => {
      onProgress?.(attempt, opts.maxAttempts, error);
      opts.onRetry?.(attempt, error);
    },
  });
}
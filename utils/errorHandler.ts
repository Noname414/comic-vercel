export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 獲取用戶友善的錯誤訊息
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof APIError) {
    if (error.status === 429) {
      return '請求太頻繁，請稍後再試';
    }
    if (error.status === 500) {
      return '服務器發生錯誤，請稍後重試';
    }
    if (error.status === 401) {
      return '身份驗證失敗，請重新整理頁面';
    }
    return '生成服務暫時無法使用，請稍後再試';
  }
  
  if (error instanceof NetworkError) {
    return '網路連線有問題，請檢查您的連線';
  }
  
  if (error instanceof Error) {
    // 檢查是否為網路相關錯誤
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '網路連線有問題，請檢查您的連線';
    }
    
    // 檢查是否為超時錯誤
    if (error.message.includes('timeout')) {
      return '請求超時，請稍後重試';
    }
    
    return error.message;
  }
  
  return '發生未知錯誤，請聯繫客服';
}

/**
 * 記錄錯誤到控制台（開發環境）或發送到監控服務（生產環境）
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('錯誤記錄:', errorInfo);
  } else {
    // 在生產環境中，這裡可以發送到監控服務如 Sentry
    console.error('錯誤記錄:', errorInfo);
  }
}

/**
 * 包裝錯誤處理的高階函數
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
}
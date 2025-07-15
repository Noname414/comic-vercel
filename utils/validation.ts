import { z } from 'zod';
import { ValidationError } from './errorHandler';

// 基礎驗證 schemas
export const ComicStyleSchema = z.enum([
  'manga',
  'webtoon',
  'blackwhite',
  'chibi',
  'realistic',
  'watercolor'
]);

export const PanelScriptSchema = z.object({
  panelNumber: z.number().int().min(1),
  description: z.string().min(1, '場景描述不能為空'),
  dialogue: z.string().optional(),
  mood: z.string().min(1, '情境氛圍不能為空'),
});

export const GenerateComicRequestSchema = z.object({
  prompt: z.string()
    .min(1, '請輸入漫畫描述')
    .max(500, '描述內容不能超過 500 字')
    .refine(
      (prompt) => prompt.trim().length > 0,
      { message: '描述內容不能只包含空格' }
    ),
  style: ComicStyleSchema,
  panelCount: z.number()
    .int('分鏡數量必須為整數')
    .min(1, '分鏡數量不能少於 1')
    .max(6, '分鏡數量不能超過 6'),
});

export const GenerateComicResponseSchema = z.object({
  images: z.array(z.string()).optional(),
  scripts: z.array(PanelScriptSchema).optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  comicId: z.number().optional(),
  createdAt: z.string().optional(), // API 返回的是 ISO 字串，不是 Date 對象
});

// 環境變數驗證
export const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY 環境變數必須設定'),
  SUPABASE_URL: z.string().url('SUPABASE_URL 必須是有效的 URL').optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY 環境變數必須設定').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

// API 響應驗證
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

export const ApiResponseSchema = z.union([
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
]);

/**
 * 安全解析並驗證數據
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      }).join('; ');

      const contextMessage = context ? `${context} - ` : '';
      throw new ValidationError(`${contextMessage}${errorMessages}`);
    }
    throw error;
  }
}

/**
 * 異步驗證（用於需要額外檢查的情況）
 */
export async function asyncValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  additionalChecks?: (data: T) => Promise<void>,
  context?: string
): Promise<T> {
  const validatedData = safeValidate(schema, data, context);

  if (additionalChecks) {
    await additionalChecks(validatedData);
  }

  return validatedData;
}

/**
 * 創建驗證中間件
 */
export function createValidator<T>(schema: z.ZodSchema<T>, context?: string) {
  return (data: unknown): T => safeValidate(schema, data, context);
}

/**
 * 驗證環境變數
 */
export function validateEnvironment(): z.infer<typeof EnvSchema> {
  const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  return safeValidate(EnvSchema, env, '環境變數驗證');
}

/**
 * 客戶端表單驗證 hook
 */
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: unknown): { isValid: boolean; errors: string[]; data?: T } => {
    try {
      const validatedData = schema.parse(data);
      return { isValid: true, errors: [], data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        });
        return { isValid: false, errors, data: undefined };
      }
      return { isValid: false, errors: ['驗證失敗'], data: undefined };
    }
  };

  return { validate };
}

/**
 * 部分驗證（用於表單即時驗證）
 */
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: Partial<unknown>,
  field?: string
): { isValid: boolean; error?: string } {
  try {
    if (field) {
      // 只驗證特定欄位
      const fieldSchema = schema.shape?.[field as keyof typeof schema.shape];
      if (fieldSchema) {
        fieldSchema.parse((data as any)[field]);
      }
    } else {
      // 部分驗證
      schema.partial().parse(data);
    }
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        isValid: false,
        error: firstError?.message || '驗證失敗'
      };
    }
    return { isValid: false, error: '驗證失敗' };
  }
}
// src/types/api.ts

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, string> | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: string;
}

/**
 * BFF API 클라이언트 (axios 인스턴스)
 * 프론트에서 BFF(Express 백엔드)를 호출할 때 사용하는 공용 인스턴스
 */

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90_000,  // 생성 소요 시간(30~40초) 고려하여 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * BFF 응답의 표준 형태
 *
 * 백엔드의 모든 엔드포인트가 이 구조를 따른다:
 *   { success: true, data: T }
 *   { success: false, error: string, details?: unknown }
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
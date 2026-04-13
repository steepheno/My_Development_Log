/**
 * BFF API 클라이언트 (axios 인스턴스)
 * 프론트에서 BFF(Express 백엔드)를 호출할 때 사용하는 공용 인스턴스
 * 
 * <참고 사항>
 * 실제 수행했던 4개 프로젝트에 실제 썸네일 이미지를 삽입하면서 소요시간 증가
 * 실제 프로젝트(4개) 약 35~40초, 가상 프로젝트(26개) 약 35~40초 소요
 */

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120_000,  // 생성 소요 시간(약 1분 10~20초) 고려하여 설정
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
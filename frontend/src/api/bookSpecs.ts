/**
 * 판형(BookSpec) 조회 API
 * BFF에서 Noise filtering이 끝난 상태로 전달됨
 * 별도 정제 작업 없이 그대로 사용
 */

import { apiClient, type ApiResponse } from './client';
import type { BookSpecCatalogItem } from '@/types/bookSpec';

export async function fetchBookSpecs(): Promise<BookSpecCatalogItem[]> {
  const res = await apiClient.get<ApiResponse<BookSpecCatalogItem[]>>('/book-specs');

  if (!res.data.success) {
    throw new Error(res.data.error);
  }

  return res.data.data;
}
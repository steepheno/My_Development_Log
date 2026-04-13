/**
 * 템플릿(Template) 카탈로그 조회 API
 * BFF에서 노이즈 필터링 + 테마별 그룹핑이 끝난 상태로 전달됨
 */

import { apiClient, type ApiResponse } from './client';
import type { TemplateCatalog } from '@/types/template';

export async function fetchTemplates(): Promise<TemplateCatalog> {
  const res = await apiClient.get<ApiResponse<TemplateCatalog>>('/templates');

  if (!res.data.success) {
    throw new Error(res.data.error);
  }

  return res.data.data;
}
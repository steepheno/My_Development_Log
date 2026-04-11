/**
 * 주문 도메인 API 함수
 * BFF의 /api/orders 엔드포인트를 호출
 */

import { apiClient, type ApiResponse } from './client';
import type { Portfolio } from '@/types/portfolio';
import type { ShippingInfo } from '@/mocks/defaultShipping';

// Request body
export interface CreateOrderRequest {
  portfolio: Portfolio;
  shipping: ShippingInfo;
}

// Response body
export interface CreateOrderResponseData {
  orderUid: string;
  bookUid: string;
  externalRef: string;
}

/**
 * 포트폴리오 + 배송지 정보를 보내 주문을 생성
 * 응답까지 30 ~ 40초 소요
 */

export async function createOrder(
  body: CreateOrderRequest
): Promise<CreateOrderResponseData> {
  const response = await apiClient.post<ApiResponse<CreateOrderResponseData>>(
    '/orders',
    body
  );

  // success: false로 응답한 경우
  if (!response.data.success) {
    throw new Error(response.data.error || '주문 생성에 실패했어요');
  }

  return response.data.data;
}
/**
 * 주문 도메인 API 함수
 * BFF의 /api/orders 엔드포인트를 호출
 * 포트폴리오 입력 데이터, 배송지 정보를 보내 주문을 생성
 * 응답까지 30 ~ 40초 소요
 */

import type { Portfolio } from '@/types/portfolio';
import type { ShippingInfo } from '@/mocks/defaultShipping';
import type { WorkflowProgressEvent } from '@/types/progress';

// Request body
export interface CreateOrderRequest {
  portfolio: Portfolio;
  shipping: ShippingInfo;
}

// Response body (Stream 완료 시)
export interface CreateOrderResponseData {
  orderUid: string;
  bookUid: string;
  externalRef: string;
}

/**
 * BFF가 SSE로 흘려보내는 이벤트들
 * (백엔드 checkout.ts의 send() payload와 1:1 매칭)
 */

export type StreamEvent =
  | { type: 'progress'; payload: WorkflowProgressEvent }
  | { type: 'done'; payload: CreateOrderResponseData }
  | { type: 'error'; payload: { code: string; userMessage: string; details: unknown } };

/**
 * SSE 에러 이벤트로부터 만들어지는 에러 객체
 *
 * 일반 fetch 네트워크 에러와 구분하기 위해 별도 클래스로 분리.
 * OrderPage의 catch에서 instanceof로 분기 가능.
 */

export class OrderStreamError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly details: unknown;

  constructor(payload: { code: string; userMessage: string; details: unknown }) {
    super(payload.userMessage);
    this.name = 'OrderStreamError';
    this.code = payload.code;
    this.userMessage = payload.userMessage;
    this.details = payload.details;
  }
}

/**
 * 포트폴리오 + 배송지를 BFF로 보내고 SSE 스트림을 받는다.
 *
 * - 진행 이벤트가 도착할 때마다 onProgress 콜백 호출
 * - 'done' 이벤트가 오면 그 payload를 resolve
 * - 'error' 이벤트가 오면 OrderStreamError로 reject
 * - 네트워크 자체가 실패하면 일반 Error로 reject
 * - 검증 실패(HTTP 400)는 일반 Error로 reject
 *
 * @returns 주문 성공 시 응답 데이터
 */

export async function createOrderStream(
  body: CreateOrderRequest,
  onProgress: (event: WorkflowProgressEvent) => void
): Promise<CreateOrderResponseData> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // 스트리밍 API 전용 fetch 함수
  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  /* ===== HTTP 단계 에러 처리 (헤더 도달 전) ===== */
  // 검증 실패는 일반 JSON 응답으로 옴 (백엔드 checkout.ts 1단계)
  if (!response.ok) {
    let errorMessage = `요청이 실패했어요 (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error) errorMessage = errBody.error;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('응답 본문이 없습니다');
  }

  /* ===== SSE 스트림 파싱 ===== */
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // done 이벤트가 오기 전에 stream이 끝나면 에러로 처리
  let finalResult: CreateOrderResponseData | null = null;
  let streamError: OrderStreamError | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 메시지는 \n\n으로 구분
      const messages = buffer.split('\n\n');
      buffer = messages.pop() ?? ''; // 마지막 미완성 조각은 다음 루프로

      for (const msg of messages) {
        if (!msg.startsWith('data: ')) continue;

        let event: StreamEvent;
        try {
          event = JSON.parse(msg.slice(6));
        } catch {
          console.warn('[createOrderStream] Failed to parse SSE message:', msg);
          continue;
        }

        if (event.type === 'progress') {
          onProgress(event.payload);
        } else if (event.type === 'done') {
          finalResult = event.payload;
        } else if (event.type === 'error') {
          streamError = new OrderStreamError(event.payload);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  /* ===== 스트림 종료 후 최종 판정 ===== */
  if (streamError) throw streamError;
  if (finalResult) return finalResult;

  // done도 error도 없이 스트림이 끝난 비정상 상황
  throw new Error('스트림이 완료되지 않은 채 종료되었어요');
}

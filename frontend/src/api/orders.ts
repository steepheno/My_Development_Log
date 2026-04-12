/**
 * 주문 도메인 API 함수
 * BFF의 /api/orders 엔드포인트를 호출
 * 포트폴리오 입력 데이터, 배송지 정보를 보내 주문을 생성
 * 응답까지 30 ~ 40초 소요
 */

import type { Portfolio } from '@/types/portfolio';
import type { ShippingInfo } from '@/mocks/defaultShipping';
import type { WorkflowProgressEvent } from '@/types/progress';

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
 * 에러 코드 상수 추가
 * 일반 네트워크 에러와 "포토북 제작 도중 서버와의 연결이 끊어졌을 때"를 구분하기 위함
 */
export const ORDER_ERROR_CODES = {
  STREAM_INTERRUPTED: 'STREAM_INTERRUPTED',
  STREAM_INCOMPLETE: 'STREAM_INCOMPLETE',
} as const;


/**
 * 재시도 불가한 스트림 중단 에러인지 판정
 *
 * STREAM_INTERRUPTED / STREAM_INCOMPLETE 둘 다 "포토북 제작이 이미 시작된 이후 서버 연결이 끊어진 상황"
 * 재시도 시 이중 결제 위험이 있음.
 * notify(토스트 문구 분기), OrderPage(뷰 상태 분기) 양쪽에서 공용으로 사용.
 */
export function isUnrecoverableStreamError(error: unknown): error is OrderStreamError {
  return (
    error instanceof OrderStreamError &&
    (error.code === ORDER_ERROR_CODES.STREAM_INTERRUPTED ||
      error.code === ORDER_ERROR_CODES.STREAM_INCOMPLETE)
  );
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

  /* 포토북 제작(Stream)이 시작됐는지 추적 */
  let hasStartedStreaming = false; // 최초 progress 이벤트 받는 순간부터 true

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
          hasStartedStreaming = true;
          onProgress(event.payload);
        } else if (event.type === 'done') {
          finalResult = event.payload;
        } else if (event.type === 'error') {
          streamError = new OrderStreamError(event.payload);
        }
      }
    }
  } catch (error) {
    /* reader.read()가 throw한 에러인 경우 */
    if (hasStartedStreaming) {
      throw new OrderStreamError({
        code: ORDER_ERROR_CODES.STREAM_INTERRUPTED,
        userMessage: '포토북 제작 중 서버와의 연결이 끊어졌어요. 다시 주문하지 마시고 고객센터로 문의해주세요.',
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 스트림 시작 전 에러는 기존처럼 네트워크 에러 return
    throw error;
  } finally {
    reader.releaseLock();
  }

  /* ===== 스트림 종료 후 최종 판정 ===== */
  if (streamError) throw streamError;
  if (finalResult) return finalResult;

  // done이나 error 없이 끝났지만 progress는 있던 경우 (서버가 조용히 연결을 닫았을 때)
  if (hasStartedStreaming) {
    throw new OrderStreamError({
      code: ORDER_ERROR_CODES.STREAM_INCOMPLETE,
      userMessage:
        '제작 중 서버와의 연결이 예기치 않게 종료되었어요. 다시 주문하지 마시고 고객센터로 문의해주세요.',
      details: 'stream ended without done event',
    });
  }

  // done도 error도 없이 스트림이 끝난 비정상 상황
  throw new Error('스트림이 완료되지 않은 채 종료되었어요');
}
/**
 * 책 생성 & 주문 진행 상황 이벤트
 *
 * 서비스 레이어가 단계마다 이 이벤트를 콜백으로 흘려보내고,
 * 라우터(checkout)가 SSE로 클라이언트에 전달한다.
 *
 * 서비스는 전송 방식(SSE/WS/폴링)을 모르고, 콜백만 호출한다.
 */

export type ProgressEvent =
  | { step: 'book_create'; status: 'start' }
  | { step: 'book_create'; status: 'done'; bookUid: string }
  | { step: 'cover_create'; status: 'start' }
  | { step: 'cover_create'; status: 'done' }
  | { step: 'contents_insert'; status: 'start'; total: number }
  | { step: 'contents_insert'; status: 'progress'; current: number; total: number }
  | { step: 'contents_insert'; status: 'done' }
  | { step: 'finalize'; status: 'start' }
  | { step: 'finalize'; status: 'done' }
  | { step: 'order_create'; status: 'start' }
  | { step: 'order_create'; status: 'done'; orderUid: string };

export type ProgressCallback = (event: ProgressEvent) => void;


/* no-op 기본값. 콜백 미주입 시에도 서비스가 안 깨지게 함. */
// 기존 호출자 있는 경우, 테스트 코드에서 콜백 인자를 생략하고 호출
export const noopProgress: ProgressCallback = () => {};
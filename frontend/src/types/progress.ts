/**
 * 책 생성 & 주문 진행 상황 이벤트
 *
 * backend/src/types/progress.ts와 일치
*/

export type WorkflowProgressEvent =
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
export const noopProgress: ProgressCallback = () => {};
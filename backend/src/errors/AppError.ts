/**
 * BFF 내부에서 사용하는 표준 에러 클래스
 *
 * 모든 라우트와 서비스는 에러 발생 시 이 클래스(또는 서브클래스)를 throw
 * 글로벌 에러 미들웨어가 이걸 받아서 일관된 응답으로 변환한다.
 */

export type ErrorCode =
  | 'VALIDATION_FAILED'      // 400 - 프론트 입력 잘못
  | 'INSUFFICIENT_CREDITS'   // 402 - sandbox 잔액 부족
  | 'SWEETBOOK_ERROR'        // 502 - SDK가 던진 그 외 에러
  | 'NETWORK_ERROR'          // 503 - SDK가 Sweetbook에 못 닿음
  | 'INTERNAL_ERROR';        // 500 - BFF 자체 버그

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly userMessage: string;
  public readonly details: unknown;

  constructor(params: {
    code: ErrorCode;
    status: number;
    userMessage: string;       // 사용자에게 보여줄 한국어 메시지
    message?: string;          // 로그용 영문 메시지 (없으면 userMessage 재사용)
    details?: unknown;
    cause?: unknown;           // 원본 에러 (디버깅용, 응답에는 미포함)
  }) {
    super(params.message ?? params.userMessage);
    this.name = 'AppError';
    this.code = params.code;
    this.status = params.status;
    this.userMessage = params.userMessage;
    this.details = params.details ?? null;

    // 원본 에러 스택 보존
    if (params.cause !== undefined) {
      (this as any).cause = params.cause;
    }
  }
}
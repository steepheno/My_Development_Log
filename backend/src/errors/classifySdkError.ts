import { AppError } from './AppError.js';

/**
 * SDK 또는 네트워크에서 던져진 임의의 에러를 AppError로 변환한다.
 *
 * 이미 AppError면 그대로 통과 (중복 wrapping 방지).
 *
 * <분류 기준>
 * - Node fetch/axios 네트워크 에러 → NETWORK_ERROR
 * - SDK 에러 메시지/상태코드에 "credit" 포함 또는 402 → INSUFFICIENT_CREDITS
 * - 그 외 SDK 에러 → SWEETBOOK_ERROR
 * - 그 외 모두 → INTERNAL_ERROR
 *
 * @param stage 에러가 발생한 단계에서의 로그 추적용 (userMessage에는 미포함)
 */

export function classifySdkError(error: unknown, stage: string): AppError {
  // 이미 분류된 에러는 return (중복 래핑 방지)
  if (error instanceof AppError) {
    return error;
  }

  const err = error as any;
  const message: string = err?.message ?? String(error);
  const lowerMessage = message.toLowerCase();
  const status: number | undefined = err?.status ?? err?.response?.status;
  const code: string | undefined = err?.code;

  /* ===== 1. 네트워크 에러 ===== */
  // Node의 undici/axios가 던지는 네트워크 실패 코드들
  const networkCodes = [
    'ECONNREFUSED',  // 서버가 연결 거부
    'ENOTFOUND',     // DNS 실패
    'ETIMEDOUT',     // 타임아웃
    'ECONNRESET',    // 연결 끊김
    'EAI_AGAIN',     // DNS 일시적 실패
  ];
  if (code && networkCodes.includes(code)) {
    return new AppError({
      code: 'NETWORK_ERROR',
      status: 503,
      userMessage: 'Sweetbook 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      message: `[${stage}] Network error: ${code} - ${message}`,
      cause: error,
    });
  }


  /* ===== 2. 충전금 부족 ===== */
  // SDK가 어떤 형식으로 던지든 잡히도록 메시지/상태 둘 다 체크
  if (
    status === 402 ||
    lowerMessage.includes('insufficient') ||
    lowerMessage.includes('credit') ||
    lowerMessage.includes('잔액')
  ) {
    return new AppError({
      code: 'INSUFFICIENT_CREDITS',
      status: 402,
      userMessage: 'sandbox 충전금이 부족합니다. 금액을 충전해주세요.',
      message: `[${stage}] Insufficient credits: ${message}`,
      details: err?.details ?? null,
      cause: error,
    });
  }


  /* ===== 3. Sweetbook SDK 에러 (그 외 모두) ===== */
  // status가 있으면 SDK가 명시적으로 던진 에러로 간주
  if (status !== undefined || err?.details !== undefined) {
    return new AppError({
      code: 'SWEETBOOK_ERROR',
      status: 502,
      userMessage: '책 제작 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      message: `[${stage}] Sweetbook SDK error (status=${status}): ${message}`,
      details: err?.details ?? null,
      cause: error,
    });
  }


  /* ===== 4. 분류 불가 (내부 에러) ===== */
  return new AppError({
    code: 'INTERNAL_ERROR',
    status: 500,
    userMessage: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    message: `[${stage}] Unclassified error: ${message}`,
    cause: error,
  });
}
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * <글로벌 에러 핸들러>
 * 모든 라우트에서 next(err)로 던진 에러를 잡아서 일관된 JSON 응답으로 변환.
 *
 * <주의>
 * 4-param 시그니처(err, req, res, next)가 반드시 있어야 Express가 "에러 핸들러"로 인식.
 * next는 사용하지 않아도 필수로 선언할 것.
 */

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // AppError가 아니면 INTERNAL_ERROR로 감싸서 처리
  // (이론상 라우트에서 classifySdkError를 거쳐서 와야 하지만, 안전망)
  const appError =
    err instanceof AppError
      ? err
      : new AppError({
          code: 'INTERNAL_ERROR',
          status: 500,
          userMessage: '서버에 문제가 발생했어요.',
          message: `Unhandled error: ${(err as any)?.message ?? String(err)}`,
          cause: err,
        });

  // 서버 로그 - 개발자용 (영문, 풀 스택)
  console.error(`[errorHandler] ${appError.code} (${appError.status})`);
  console.error(`  message: ${appError.message}`);
  if ((appError as any).cause) {
    console.error('  cause:', (appError as any).cause);
  }

  // 클라이언트 응답 - 사용자용 (한국어, 최소 정보)
  res.status(appError.status).json({
    success: false,
    code: appError.code,
    error: appError.userMessage,
    details: appError.details,
  });
}
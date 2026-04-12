import type { CreateOrderRequest } from '../types/orderRequest.js';
import type { ProgressCallback } from '../types/progress.js';
import { Router, Request, Response, NextFunction } from 'express';
import { createBookFromPortfolio } from '../services/bookService.js';
import { createOrderForBook } from '../services/orderService.js';
import { AppError } from '../errors/AppError.js';

const router = Router();

/**
 * POST /api/orders
 *
 * 포트폴리오 데이터 + 배송지를 받아서 책을 만들고 주문까지 처리한다.
 * 내부적으로 책 생성(create → cover → contents × N → finalize)과
 * 주문 생성을 순차 실행한다.
 *
 * ==============================================================================
 * 
 * 응답이 SSE 스트림이므로, 클라이언트는 fetch + ReadableStream으로 받아야 한다.
 * (EventSource는 GET만 지원해서 사용 불가)
 *
 * <이벤트 종류>
 * - { type: 'progress', payload: ProgressEvent } - 단계별 진행 상황
 * - { type: 'done',     payload: { orderUid, bookUid, externalRef } } - 최종 성공
 * - { type: 'error',    payload: { code, userMessage, details } } - 워크플로우 중 실패
 *
 * <에러 처리 규칙>
 * - 입력 검증 실패: 헤더 열기 전이므로 일반 HTTP 400 + next(error)로 글로벌 핸들러 위임
 * - 워크플로우 중 실패: 헤더가 이미 열려서 HTTP 상태 변경 불가 → SSE 'error' 이벤트로 흘리고 정상 종료
 */

router.post('/', async (req: Request, res: Response) => {
  console.log('[checkout] ▶ Workflow started (SSE)');

  /* ===== 1. 입력 검증 (헤더 열기 전) ===== */
  const { portfolio, shipping } = req.body as CreateOrderRequest;

  // 빠진 필드를 구체적으로 알려줌
  const missingFields: string[] = [];
  if (!portfolio?.cover) missingFields.push('portfolio.cover');
  if (!portfolio?.projects) missingFields.push('portfolio.projects');
  if (!shipping) missingFields.push('shipping');
  else {
    if (!shipping.recipientName) missingFields.push('shipping.recipientName');
    if (!shipping.recipientPhone) missingFields.push('shipping.recipientPhone');
    if (!shipping.postalCode) missingFields.push('shipping.postalCode');
    if (!shipping.address1) missingFields.push('shipping.address1');
  }

  if (missingFields.length > 0) {
    // 헤더 아직 안 열렸으니 일반 HTTP 응답으로 끝내도 됨
    return res.status(400).json({
      success: false,
      error: `필수 입력값이 누락되었어요: ${missingFields.join(', ')}`,
      details: { missingFields },
    });
  }

  /* ===== 2. SSE 헤더 열기 ===== */
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx 등 프록시의 버퍼링 방지
  res.flushHeaders();

  // SSE 이벤트 송신 헬퍼
  const send = (event: { type: string; payload?: unknown }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // 클라이언트가 도중에 끊었는지 추적 (끊긴 후 write 시도하면 에러)
  const isClosed = () => res.writableEnded || res.destroyed;

  req.on('close', () => {
    if (!res.writableEnded) {
      console.log('[checkout] Client disconnected mid-stream');
    }
  });

  /* ===== 3. 워크플로우 실행 ===== */
  try {
    const onProgress: ProgressCallback = e => {
      if (isClosed()) return;
      send({ type: 'progress', payload: e });
    };

    const bookUid = await createBookFromPortfolio(portfolio, onProgress);
    const { orderUid, externalRef } = await createOrderForBook(bookUid, shipping, onProgress);

    if (!isClosed()) {
      send({ type: 'done', payload: { orderUid, bookUid, externalRef } });
      console.log(`[checkout] ✅ Workflow completed - bookUid=${bookUid}, orderUid=${orderUid}`);
    }
  } catch (error) {
    // 헤더가 이미 열려서 HTTP 상태 변경 불가
    // → SSE error 이벤트로 흘려보내고 정상 종료
    console.error('[checkout] ❌ Workflow failed:', error);

    if (!isClosed()) {
      const payload =
        error instanceof AppError
          ? {
              code: error.code,
              userMessage: error.userMessage,
              details: error.details,
            }
          : {
              code: 'INTERNAL_ERROR' as const,
              userMessage: '주문 처리 중 알 수 없는 오류가 발생했어요',
              details: null,
            };
      send({ type: 'error', payload });
    }
  } finally {
    if (!isClosed()) {
      res.end();
    }
  }
});

export default router;

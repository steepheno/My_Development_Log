import type { CreateOrderRequest } from '../types/orderRequest.js';
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
 */

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('[checkout] ▶ Workflow started');

  try {
    const { portfolio, shipping } = req.body as CreateOrderRequest;

    /* ===== 입력 검증 ===== */
    // 어떤 필드가 빠졌는지 구체적으로 알려줌
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
      throw new AppError({
        code: 'VALIDATION_FAILED',
        status: 400,
        userMessage: `필수 입력값이 누락되었어요: ${missingFields.join(', ')}`,
        message: `Validation failed: missing fields - ${missingFields.join(', ')}`,
        details: { missingFields },
      });
    }

    // 1. 책 생성 (create → cover → contents × N → finalize)
    const bookUid = await createBookFromPortfolio(portfolio);

    // 2. 주문 생성
    const { orderUid, externalRef } = await createOrderForBook(bookUid, shipping);

    console.log(`[checkout] ✅ Workflow completed - bookUid=${bookUid}, orderUid=${orderUid}`);

    return res.json({
      success: true,
      data: {
        orderUid,
        bookUid,
        externalRef,
      },
    });
  } catch (error) {
    next(error)
  }
});

export default router;
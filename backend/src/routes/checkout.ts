import type { CreateOrderRequest } from '../types/orderRequest.js';
import { Router, Request, Response } from 'express';
import { createBookFromPortfolio } from '../services/bookService.js';
import { createOrderForBook } from '../services/orderService.js';

const router = Router();

/**
 * POST /api/orders
 *
 * 포트폴리오 데이터 + 배송지를 받아서 책을 만들고 주문까지 처리한다.
 * 내부적으로 책 생성(create → cover → contents × N → finalize)과
 * 주문 생성을 순차 실행한다.
 */

router.post('/', async (req: Request, res: Response) => {
  console.log('[checkout] ▶ Workflow started');

  try {
    const { portfolio, shipping } = req.body as CreateOrderRequest;

    // 최소 입력 검증
    if (!portfolio?.cover || !portfolio?.projects || !shipping) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body: portfolio and shipping are required',
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
  } catch (error: any) {
    console.error('[orders] Failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

export default router;
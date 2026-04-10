import type { CreateOrderRequest } from '../types/orderRequest.js';
import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';

const router = Router();

/**
 * POST /api/orders
 */

router.post('/', async (req: Request, res: Response) => {
  try {
    const { portfolio, shipping } = req.body as CreateOrderRequest;

    // 최소 입력 검증 - 필수 필드가 아예 없으면 400
    if (!portfolio?.cover || !portfolio?.projects || !shipping) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body: portfolio and shipping are required',
      });
    }

    /* ===== 1단계: 책 생성 (books.create) ===== */
    console.log('[orders] Creating book...');
    const book = await sweetbook.books.create({
      bookSpecUid: 'PHOTOBOOK_A5_SC',
      title: `${portfolio.cover.developerName}의 개발일지`,
      creationType: 'TEST',
    });

    // SDK가 bookUid or uid 둘 중 하나로 반환
    const bookUid = book.bookUid || book.uid;
    if (!bookUid) {
      throw new Error('SDK response missing bookUid');
    }
    console.log(`[orders] Book created: ${bookUid}`);


    // 임시 응답 — 현재는 bookUid만 반환 (6단계에서 orderUid로 교체 예정)
    return res.json({
      success: true,
      data: {
        bookUid,
        message: '[3단계] 책 생성까지 완료. 이후 단계는 구현 예정.',
      },
    });
  } catch (error: any) {
    console.error('[orders] Failed:', error);  // 어느 라우터에서 나온 에러인지 확인하기 위해 [orders] 작성
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

export default router;
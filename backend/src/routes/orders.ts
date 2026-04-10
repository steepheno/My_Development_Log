import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';
import type { CreateOrderRequest } from '../types/orderRequest.js';
import { toCoverTemplateParams } from '../utils/portfolioMapper.js';
import { BOOK_COVER_TEMPLATE_UID } from '../types/sweetbookTemplates.js';

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

    /* ===== 2단계: 표지 생성 (covers.create) ===== */
    console.log('[orders] Creating cover...');
    const coverParams = toCoverTemplateParams(portfolio.cover);
    await sweetbook.covers.create(bookUid, BOOK_COVER_TEMPLATE_UID, coverParams);
    console.log('[orders] Cover created');

    // TODO 5단계: contents.insert × N
    // TODO 6단계: books.finalize, orders.create

    // 임시 응답 — 현재는 bookUid만 반환 (6단계에서 orderUid로 교체 예정)
    return res.json({
      success: true,
      data: {
        bookUid,
        message: '[4단계] 책 생성 + 표지까지 완료.',
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

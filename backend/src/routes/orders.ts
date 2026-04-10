import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';
import type { CreateOrderRequest } from '../types/orderRequest.js';
import { toCoverTemplateParams, projectsToContentPages } from '../utils/portfolioMapper.js';
import { BOOK_COVER_TEMPLATE_UID } from '../types/sweetbookTemplates.js';
import { randomUUID } from 'crypto';

const router = Router();

/**
 * POST /api/orders
 *
 * 포트폴리오 데이터 + 배송지를 받아서 책을 만들고 주문까지 처리
 * 내부적으로 5번의 SDK 호출이 순차 실행된다:
 *   1. books.create
 *   2. covers.create
 *   3. contents.insert × 30 (프로젝트 데이터 기반)
 *   4. books.finalize
 *   5. orders.create
 */

router.post('/', async (req: Request, res: Response) => {
  try {
    const { portfolio, shipping } = req.body as CreateOrderRequest;

    // 최소 입력 검증
    if (!portfolio?.cover || !portfolio?.projects || !shipping) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body: portfolio and shipping are required',
      });
    }

    /* ===== 1. 책 생성 (books.create) ===== */
    console.log('[orders] Creating book...');
    const book = await sweetbook.books.create({
      bookSpecUid: 'PHOTOBOOK_A5_SC',
      title: `${portfolio.cover.developerName}의 개발일지`,
      creationType: 'TEST',
    });

    const bookUid = book.bookUid || book.uid;
    if (!bookUid) {
      throw new Error('SDK response missing bookUid');
    }
    console.log(`[orders] Book created: ${bookUid}`);


    /* ===== 2. 표지 생성 (covers.create) ===== */
    console.log('[orders] Creating cover...');
    const coverParams = toCoverTemplateParams(portfolio.cover);
    await sweetbook.covers.create(bookUid, BOOK_COVER_TEMPLATE_UID, coverParams);
    console.log('[orders] Cover created');


    /* ===== 3. 내지 생성 (contents.insert × N) ===== */
    const contentPages = projectsToContentPages(portfolio.projects);
    console.log(`[orders] Generated ${contentPages.length} content pages from ${portfolio.projects.length} projects`);

    for (let i = 0; i < contentPages.length; i++) {
      const page = contentPages[i];
      console.log(`[orders] Inserting content ${i + 1}/${contentPages.length} (${page.kind})...`);
      await sweetbook.contents.insert(bookUid, page.templateUid, page.parameters);
    }
    console.log('[orders] All contents inserted');


    /* ===== 4. 책 최종화 (books.finalize) ===== */
    console.log('[orders] Finalizing book...');
    const finalizeResult = await sweetbook.books.finalize(bookUid);
    console.log('[orders] Book finalized:', finalizeResult);


    /* ===== 5. 주문 생성 (orders.create) ===== */
    console.log('[orders] Creating order...');

    // 프론트의 ShippingInfo → SDK shipping 형식 매핑
    const sdkShipping = {
      recipientName: shipping.recipientName,
      recipientPhone: shipping.recipientPhone,
      postalCode: shipping.postalCode,
      address1: shipping.address1,
      address2: shipping.address2,
      shippingMemo: shipping.memo,
    };

    // externalRef: BFF 측 식별자. 디버깅 및 추적용
    const externalRef = `dev-diary-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const order = await sweetbook.orders.create({
      items: [{ bookUid, quantity: 1 }],
      shipping: sdkShipping,
      externalRef,
    });
    console.log(`[orders] Order created: ${order.orderUid}`);

    /* ===== 응답 ===== */
    return res.json({
      success: true,
      data: {
        orderUid: order.orderUid,
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
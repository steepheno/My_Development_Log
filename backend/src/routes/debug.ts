/**
 * [개발 검증용 / 의도적 보존]
 * BFF가 SDK를 통해 Sweetbook API와 통신하는지 가장 먼저 검증한 엔드포인트.
 * books.list가 SDK 측 405 에러로 사용 불가하여 credits.getBalance로 대체 검증.
 * 
 * 정식 기능 라우트는 /api/book-specs에 분리되어 있으며,
 * 아래 핸들러들은 SDK 연결 상태를 빠르게 확인하는 헬스체크 용도로 유지함.
 * 
 */

import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';

const router = Router();

// GET /api/debug/credits - 충전금 잔액 조회 (SDK 연결 테스트)
router.get('/credits', async (req: Request, res: Response) => {
  try {
    const result = await sweetbook.credits.getBalance();
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('SDK call failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

// GET /api/debug/book-specs - 판형 목록 조회 (SDK 확장 검증)
// 테스트 코드 (테스트 완료, 주석 처리)
// router.get('/book-specs', async (req: Request, res: Response) => {
//   try {
//     const data = await sweetbook.bookSpecs.list();
//     res.json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error: any) {
//     console.error('SDK call failed:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       details: error.details || null,
//     });
//   }
// });

export default router;
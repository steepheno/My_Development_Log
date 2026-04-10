import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';

const router = Router();

// GET /api/debug/credits - 충전금 잔액 조회 (SDK 연결 테스트)
// books.list는 SDK에서 405 에러 발생 (Sweetbook 서버측 이슈)
// 대신 credits.getBalance로 SDK 연결 상태를 검증
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

export default router;
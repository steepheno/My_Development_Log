import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';

const router = Router();

// GET /api/debug/books - 책 목록 조회 (SDK 연결 테스트)
router.get('/books', async (req: Request, res: Response) => {
  try {
    const result = await sweetbook.books.list();
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
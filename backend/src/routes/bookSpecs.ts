import { Request, Response, Router } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';
import { toCatalog } from '../services/bookSpecMapper.js';

const router = Router();

/* GET /api/book-specs - 판형 목록 조회 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const raw = await sweetbook.bookSpecs.list();
    const data = toCatalog(raw);

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('BookSpecs fetch failed: ', error);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

export default router;

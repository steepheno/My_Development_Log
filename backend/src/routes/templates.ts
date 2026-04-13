import type { TemplateCatalogResponse } from "../types/template";
import { Request, Response, Router } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';
import { toTemplateCatalog } from '../services/templatesMapper.js';

const router = Router();

let cachedCatalog: TemplateCatalogResponse | null = null;
let cachedAt: Date | null = null;

async function fetchAllRawTemplates(): Promise<any[]> {
  const all: any[] = [];
  let offset = 0;
  const limit = 50;
  const maxPages = 10;  // 무한루프 방어

  for (let page = 0; page < maxPages; page++) {
    const body: any = await sweetbook.templates.list({ limit, offset });
    const items: any[] =
      body?.data?.templates ??
      body?.templates ??
      body?.data ??
      (Array.isArray(body) ? body : []);

    if (items.length === 0) break;
    all.push(...items);

    const pagination = body?.pagination ?? body?.data?.pagination;
    const hasNext = pagination?.hasNext ?? items.length === limit;
    if (!hasNext) break;
    offset += limit;
  }

  return all;
}

/* GET /api/templates - 템플릿 카탈로그 조회 (테마별 그룹화) */
router.get('/', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === '1';

    if (!cachedCatalog || forceRefresh) {
      // 서버 로그 메시지 (Cache miss 또는 refresh 구분)
      console.log(
        `[templates] Cache ${forceRefresh ? 'refresh' : 'miss'}, fetching from Sweetbook...`
      );

      const raw = await fetchAllRawTemplates();
      cachedCatalog = toTemplateCatalog(raw);
      cachedAt = new Date();
      console.log(
        `[templates] Cached ${cachedCatalog.totalTemplates} templates ` +
        `(${cachedCatalog.regularThemes.length} regular themes + ` +
        `${cachedCatalog.utilityGroup ? '1 utility group' : 'no utility'})`
      );
    }

    res.json({
      success: true,
      data: cachedCatalog,
      cachedAt: cachedAt?.toISOString() ?? null,
    });
  } catch (error: any) {
    console.error('[templates] fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

export default router;
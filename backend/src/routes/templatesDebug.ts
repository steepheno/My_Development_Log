/**
 * [일회성 진단 라우트]
 * 템플릿 카탈로그 조회 구현을 위해 응답 구조를 파악하기 위한 임시 라우트.
 * 
 * 테스트 완료 (src/routes에는 포함하지 않음)
 */

import { Router, Request, Response } from 'express';
import { sweetbook } from '../services/sweetbookClient.js';

const router = Router();

// 분포 카운팅용 헬퍼
function tally(items: any[], keyFn: (item: any) => string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item) ?? '(null)';
    map[key] = (map[key] ?? 0) + 1;
  }

  // 빈도 내림차순 정렬
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => b[1] - a[1])
  );
}

// 교차표 (rows × cols)
function crosstab(
  items: any[],
  rowFn: (item: any) => string,
  colFn: (item: any) => string
): Record<string, Record<string, number>> {
  const table: Record<string, Record<string, number>> = {};
  for (const item of items) {
    const row = rowFn(item) ?? '(null)';
    const col = colFn(item) ?? '(null)';
    if (!table[row]) table[row] = {};
    table[row][col] = (table[row][col] ?? 0) + 1;
  }
  return table;
}

// templateName에서 theme 추출 시도
function extractThemeFromName(name: string | null | undefined): string {
  if (!name) return '(no name)';
  const match = name.match(/^(알림장[A-C]|일기장[A-C]|구글포토북[A-C])/);
  return match ? match[1] : '(no match)';
}

router.get('/diagnose', async (req: Request, res: Response) => {
  try {
    const all: any[] = [];
    let offset = 0;
    const limit = 50;
    let pageCount = 0;
    const maxPages = 10; // 무한루프 방지

    // 페이지네이션 루프
    while (pageCount < maxPages) {
      const body: any = await sweetbook.templates.list({ limit, offset });
      pageCount++;

      // 응답 구조가 불확실하므로 여러 형태 방어
      const items: any[] =
        body?.data?.templates ??
        body?.templates ??
        body?.data ??
        (Array.isArray(body) ? body : []);

      console.log(
        `[diagnose] page ${pageCount} offset=${offset} fetched=${items.length}`
      );

      if (items.length === 0) break;
      all.push(...items);

      // 종료 조건: pagination 메타가 있으면 그걸로, 없으면 limit 미만이면 마지막
      const pagination = body?.pagination ?? body?.data?.pagination;
      const hasNext =
        pagination?.hasNext ??
        (items.length === limit); // 메타 없으면 가득 찼으면 계속

      if (!hasNext) break;
      offset += limit;
    }

    // 분포 집계
    const total = all.length;
    const byTemplateKind = tally(all, (t) => t.templateKind);
    const byTheme = tally(all, (t) => t.theme);
    const byBookSpec = tally(all, (t) => t.bookSpecUid);
    const byStatus = tally(all, (t) => t.status);
    const byCategory = tally(all, (t) => t.category);
    const byIsPublic = tally(all, (t) => String(t.isPublic));

    // 교차표
    const themeByKind = crosstab(
      all,
      (t) => t.theme ?? '(null)',
      (t) => t.templateKind ?? '(null)'
    );
    const nameThemeByKind = crosstab(
      all,
      (t) => extractThemeFromName(t.templateName),
      (t) => t.templateKind ?? '(null)'
    );
    const bookSpecByKind = crosstab(
      all,
      (t) => t.bookSpecUid ?? '(null)',
      (t) => t.templateKind ?? '(null)'
    );

    // theme 필드 null 비율
    const themeNullCount = all.filter((t) => t.theme == null).length;
    const themeFromNameMatchCount = all.filter(
      (t) => extractThemeFromName(t.templateName) !== '(no match)'
    ).length;

    // templateName 전체 샘플
    const allNames = all.map((t) => ({
      name: t.templateName,
      kind: t.templateKind,
      theme: t.theme,
      bookSpec: t.bookSpecUid,
    }));

    // 각 kind별 상세 샘플 1개씩
    const samplesByKind: Record<string, any> = {};
    for (const item of all) {
      const kind = item.templateKind ?? '(null)';
      if (!samplesByKind[kind]) {
        samplesByKind[kind] = {
          templateUid: item.templateUid,
          templateName: item.templateName,
          templateKind: item.templateKind,
          theme: item.theme,
          category: item.category,
          bookSpecUid: item.bookSpecUid,
          isPublic: item.isPublic,
          status: item.status,
          topLevelKeys: Object.keys(item).sort(),  // 어떤 필드가 있는지
          hasThumbnails: 'thumbnails' in item,  // 썸네일 관련 필드 존재 여부
          thumbnailsValue: item.thumbnails ?? null,
          
          // layout 크기 (SVG fallback용)
          layoutWidth: item.layout?.width ?? null,
          layoutHeight: item.layout?.height ?? null,
        };
      }
    }

    res.json({
      success: true,
      summary: {
        total,
        pagesFetched: pageCount,
        themeNullCount,
        themeNullRatio: `${((themeNullCount / total) * 100).toFixed(1)}%`,
        themeFromNameMatchCount,
        themeFromNameMatchRatio: `${((themeFromNameMatchCount / total) * 100).toFixed(1)}%`,
      },
      distributions: {
        byTemplateKind,
        byTheme,
        byBookSpec,
        byStatus,
        byCategory,
        byIsPublic,
      },
      crosstabs: {
        themeByKind,
        nameThemeByKind,
        bookSpecByKind,
      },
      samplesByKind,
      allNames,
    });
  } catch (error: any) {
    console.error('[diagnose] failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

export default router;
/**
 * 원본 Sweetbook Templates 응답을 프론트용 카탈로그 구조로 변환.
 *
 * 주요 책임:
 *  1. 노이즈/이상치 필터링 (theme: null)
 *  2. 필드 평탄화 (thumbnails.layout → thumbnailUrl)
 *  3. 라벨 정제 (templateName 꼬리표 제거, bookSpecUid → 사람 읽는 라벨)
 *  4. theme × bookSpec 중첩 그룹핑
 *  5. '공용' 테마를 utilityGroup으로 분리 (옵션 A)
 */

import type {
  TemplateCatalogItem,
  TemplateCatalogResponse,
  TemplateKind,
  TemplateThemeGroup,
} from '../types/template.js';

/* -----라벨 Mapping ----- */
// 프론트가 쓸 판형 라벨을 BFF에서 확정
// 새 판형이 추가되어도 unknown fallback으로 깨지지 않도록 방어
const BOOK_SPEC_LABELS: Record<string, string> = {
  PHOTOBOOK_A5_SC: 'A5 소프트커버',
  PHOTOBOOK_A4_SC: 'A4 소프트커버',
  SQUAREBOOK_HC: '스퀘어북 하드커버',
};

const KIND_LABELS: Record<TemplateKind, string> = {
  cover: '표지',
  content: '내지',
  divider: '간지',
  publish: '발행면',
};

// 정규 테마 노출 순서 - 파트너 포털 페이지 컨벤션에 맞춤
const THEME_ORDER = [
  '구글포토북A', '구글포토북B', '구글포토북C',
  '알림장A', '알림장B', '알림장C',
  '일기장A', '일기장B',
  // 미정 테마 (새 테마 추가 시 깨지지 않도록 맨 뒤로)
];

const UTILITY_THEME = '공용';

// 판형 노출 순서 - 작은 판형부터
const BOOK_SPEC_ORDER = ['PHOTOBOOK_A5_SC', 'PHOTOBOOK_A4_SC', 'SQUAREBOOK_HC'];


/* ===== 헬퍼 ===== */

/**
 * templateName에서 판형 꼬리표를 제거.
 * ex) '표지 (A4 소프트커버 포토북)' → '표지'
 *     '내지_월시작 (A5 소프트커버 포토북)' → '내지_월시작'
 */
function cleanTemplateName(raw: string | null | undefined): string {
  if (!raw) return '(이름 없음)';
  return raw.replace(/\s*\([^)]*포토북\)\s*$/, '').trim();
}

function getBookSpecLabel(uid: string): string {
  return BOOK_SPEC_LABELS[uid] ?? uid;
}

function getKindLabel(kind: string): string {
  return KIND_LABELS[kind as TemplateKind] ?? kind;
}

/**
 * 단일 원본 템플릿을 프론트용 아이템으로 변환.
 */
function toCatalogItem(raw: any): TemplateCatalogItem {
  return {
    templateUid: raw.templateUid,
    displayName: cleanTemplateName(raw.templateName),
    templateKind: raw.templateKind as TemplateKind,
    kindLabel: getKindLabel(raw.templateKind),
    bookSpecUid: raw.bookSpecUid,
    bookSpecLabel: getBookSpecLabel(raw.bookSpecUid),
    thumbnailUrl: raw.thumbnails?.layout ?? null,
  };
}

/**
 * 같은 테마의 템플릿들을 bookSpecUid별로 그룹핑 + 정렬.
 */
function groupByBookSpec(items: TemplateCatalogItem[]) {
  const map = new Map<string, TemplateCatalogItem[]>();
  for (const item of items) {
    if (!map.has(item.bookSpecUid)) map.set(item.bookSpecUid, []);
    map.get(item.bookSpecUid)!.push(item);
  }

  // 그룹 내부 정렬: kind 순서 (표지 → 내지 → 간지 → 발행면)
  const kindOrder: TemplateKind[] = ['cover', 'content', 'divider', 'publish'];
  for (const list of map.values()) {
    list.sort((a, b) => {
      const ka = kindOrder.indexOf(a.templateKind);
      const kb = kindOrder.indexOf(b.templateKind);
      if (ka !== kb) return ka - kb;
      return a.displayName.localeCompare(b.displayName, 'ko');
    });
  }

  // 판형 순서대로 배열 변환
  return BOOK_SPEC_ORDER
    .filter((uid) => map.has(uid))
    .map((uid) => ({
      bookSpecUid: uid,
      bookSpecLabel: getBookSpecLabel(uid),
      templates: map.get(uid)!,
    }));
}

/**
 * 테마명과 해당 테마 아이템들을 받아 ThemeGroup 구조로.
 */
function buildThemeGroup(theme: string, items: TemplateCatalogItem[]): TemplateThemeGroup {
  return {
    theme,
    totalCount: items.length,
    byBookSpec: groupByBookSpec(items),
  };
}


/* ----- 메인 매퍼 ----- */

export function toTemplateCatalog(rawTemplates: any[]): TemplateCatalogResponse {
  // 테스트 결과, 148개 중 1개('알림장B_내지_fill', theme: null)만 해당
  // 개발 잔여물로 판단하여 노출 제외

  // 1. theme: null 이상치 필터링
  const valid = rawTemplates.filter((t) => t.theme != null);

  // 2. 공통 변환
  const items = valid.map(toCatalogItem);

  // 3. theme별 1차 그룹핑
  const byTheme = new Map<string, TemplateCatalogItem[]>();
  for (let i = 0; i < valid.length; i++) {
    const theme = valid[i].theme as string;
    if (!byTheme.has(theme)) byTheme.set(theme, []);
    byTheme.get(theme)!.push(items[i]);
  }

  // 4. '공용' 분리 (옵션 A)
  const utilityItems = byTheme.get(UTILITY_THEME);
  byTheme.delete(UTILITY_THEME);

  // 5. 정규 테마 정렬 (THEME_ORDER 기준, 미정 테마는 뒤로)
  const regularThemes: TemplateThemeGroup[] = [];
  for (const theme of THEME_ORDER) {
    const list = byTheme.get(theme);
    if (list) {
      regularThemes.push(buildThemeGroup(theme, list));
      byTheme.delete(theme);
    }
  }
  // 미정 테마(향후 추가될 수 있는) fallback
  for (const [theme, list] of byTheme.entries()) {
    regularThemes.push(buildThemeGroup(theme, list));
  }

  // 6. utility group 조립
  const utilityGroup = utilityItems
    ? buildThemeGroup(UTILITY_THEME, utilityItems)
    : null;

  return {
    regularThemes,
    utilityGroup,
    totalTemplates: items.length,
  };
}
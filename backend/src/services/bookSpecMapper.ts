import { BookSpecCatalogItem } from '../types/bookSpec';

// SDK가 .js 파일이므로 any 타입으로 설정
export function toCatalogItem(raw: any): BookSpecCatalogItem | null {
  if (!raw.name) return null;

  return {
    bookSpecUid: raw.bookSpecUid,
    name: raw.name,

    innerTrimWidthMm: raw.innerTrimWidthMm,
    innerTrimHeightMm: raw.innerTrimHeightMm,
    sizeLabel: `${raw.innerTrimWidthMm} × ${raw.innerTrimHeightMm} mm`,

    pageMin: raw.pageMin,
    pageMax: raw.pageMax,
    pageIncrement: raw.pageIncrement,
    pageLabel: `${raw.pageMin} ~ ${raw.pageMax}페이지 (${raw.pageIncrement}페이지 단위)`,

    coverType: raw.coverType,
    bindingType: raw.bindingType,
    lamination: raw.paper?.lamination ?? '',
    innerPaper: raw.paper?.inner?.paper ?? '',
  };
}

// 타입 설정 시작
export function toCatalog(rawList: any[]): BookSpecCatalogItem[] {
  return rawList.map(toCatalogItem).filter((item): item is BookSpecCatalogItem => item !== null);
}

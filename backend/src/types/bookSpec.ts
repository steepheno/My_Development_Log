export type BookSpecCatalogItem = {
  // 식별/표시
  bookSpecUid: string;
  name: string;  // ex) 'A5 소프트커버 포토북'

  // 크기 — SVG 비율 카드용 원본 + 라벨 둘 다
  innerTrimWidthMm: number;     
  innerTrimHeightMm: number;    
  sizeLabel: string;  // ex) '148 × 210 mm' (BFF에서 미리 조합)

  // 페이지 — 원본 + 라벨
  pageMin: number;
  pageMax: number;
  pageIncrement: number;
  pageLabel: string;  // ex) '50 ~ 200페이지 (2페이지 단위)' - BFF에서 미리 조합

  // 제작 사양
  coverType: string;
  bindingType: string;
  lamination: string;
  innerPaper: string;

  // 가격 필드는 제외
};
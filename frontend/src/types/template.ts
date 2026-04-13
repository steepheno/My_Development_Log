// BFF가 정제해서 내려주는 개별 템플릿 아이템
export type TemplateCatalogItem = {
  templateUid: string;
  displayName: string;          // ex) '표지' (판형 꼬리표 제거된 이름)
  templateKind: TemplateKind;
  kindLabel: string;            // ex) '표지' | '내지'
  bookSpecUid: string;
  bookSpecLabel: string;        // ex) 'A5 소프트커버' | '스퀘어북 (하드커버)'
  thumbnailUrl: string | null;
};

export type TemplateKind = 'cover' | 'content' | 'divider' | 'publish';

// 한 테마 안의 템플릿들을 판형별로 묶음
export type TemplateThemeGroup = {
  theme: string;                // ex) '알림장A'
  totalCount: number;
  byBookSpec: {
    bookSpecUid: string;
    bookSpecLabel: string;
    templates: TemplateCatalogItem[];
  }[];
};

// BFF /api/templates 응답 data 필드
export type TemplateCatalog = {
  regularThemes: TemplateThemeGroup[];      // 8개 정규 테마
  utilityGroup: TemplateThemeGroup | null;  // '공용' 섹션 (옵션 A)
  totalTemplates: number;                   // 필터아웃 후 실제 노출 수
};

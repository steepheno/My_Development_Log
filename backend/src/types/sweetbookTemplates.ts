/**
 * 책 표지 템플릿 UID (알림장B 테마, A5 소프트커버)
 *
 * 내지는 일기장B 테마를 쓰지만, 커버는 알림장B 테마를 사용
 * 프론트엔드의 placeholder 스키마와 완벽히 일치하는 표지 템플릿이 알림장B에 있어 선택
 * 플레이스홀더 키: childName, schoolName, volumeLabel, periodText, coverPhoto
 */

export const BOOK_COVER_TEMPLATE_UID = '2pmWxMXzE8Ko';

// ========== 1. Books ==========
/* POST /api/books — 책 생성 요청 */
export interface CreateBookRequest {
  bookSpecUid: string;
  title: string;

  /* 긴급 수정 - Sweetbook API가 허용하는 타입으로 수정 (26.04.15 18:00 API 응답 검증으로 확인) */
  creationType?: 'EBOOK_SYNC' | 'PDF_UPLOAD';
}

/* POST /api/books — 책 생성 응답 (BFF가 SDK 결과를 그대로 중계) */
export interface CreateBookResponse {
  bookUid: string;
}


// ========== 2. Cover - 표지 템플릿 placeholder ==========
/**
 * 표지 템플릿이 요구하는 placeholder 키 집합.
 */
export interface CoverTemplateParams {
  childName: string;    // 개발자 이름 매핑
  schoolName: string;   // 직무 매핑
  volumeLabel: string;  // 권 표시
  periodText: string;   // 활동 기간
  coverPhoto: string;   // 표지 사진
}

/** POST /api/books/:bookUid/cover — 표지 생성 요청 */
export interface CreateCoverRequest {
  templateUid: string;
  parameters: CoverTemplateParams;
}


// ========== 3. Content (내지 템플릿) ==========
export const DIARY_B_TEMPLATES = {
  COVER_PAGE: '2qld1DLewXv9',
  BODY_PAGE: '3DGPZzdQwVKE',
} as const;

export interface DiaryCoverPageParams {
  photo1: string;     // 좌측 전체 사진 (파일 업로드 or URL)
  date: string;       // 날짜 텍스트 (ex. 4.9)
  title: string;      // 소제목 ("\n"으로 줄바꿈 가능)
  diaryText: string;  // 일기 본문 텍스트 (내지a는 400자 이내 짧은 버전)
}

/**
 * 일기장B 내지b 템플릿이 요구하는 파라미터
 */
export interface DiaryBodyPageParams {
  date: string;
  title: string;
  diaryText: string;  // 일기 본문 텍스트 (1,500자 이내 긴 버전)
}

export type ContentPageRequest =
  | { kind: 'cover'; templateUid: string; parameters: DiaryCoverPageParams }
  | { kind: 'body'; templateUid: string; parameters: DiaryBodyPageParams };

/**
 * 여러 페이지를 한 번에 생성할 때 BFF가 받는 요청.
 */
export interface InsertContentsBatchRequest {
  pages: ContentPageRequest[];
}


// ========== 4. Finalize ==========
/** POST /api/books/:bookUid/finalize 응답 */
export interface FinalizeBookResponse {
  bookUid: string;
  status: string;
}
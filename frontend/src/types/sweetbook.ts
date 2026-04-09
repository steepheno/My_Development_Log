/**
 * Sweetbook Book Print API — 요청 DTO 타입
 *
 * Sweetbook이 요구하는 외부 API 스펙이다.
 * 이 파일의 타입은 우리 도메인 모델(types/portfolio.ts)과 독립적으로,
 * Sweetbook 템플릿 placeholder 키 집합을 그대로 반영한다.
 *
 * 실제 API 호출은 BFF(Express) 에서 SDK를 통해 수행되며,
 * 프론트엔드는 이 타입으로 페이로드를 만들어 BFF에 전달한다.
 */

// ========== 1. Books ==========
/* POST /api/books — 책 생성 요청 */
export interface CreateBookRequest {
  bookSpecUid: string;
  title: string;
  creationType?: 'NORMAL' | 'TEST';
}

/* POST /api/books — 책 생성 응답 (BFF가 SDK 결과를 그대로 중계) */
export interface CreateBookResponse {
  bookUid: string;
}


// ========== 2. Cover - 표지 템플릿 placeholder ==========
/**
 * 표지 템플릿이 요구하는 placeholder 키 집합.
 * 예제 스크립트 01_create.js 의 covers.create 호출을 근거로 한다.
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
/**
 * 일기장B 테마의 템플릿 UID 상수.
 * A5 소프트커버 포토북 (PHOTOBOOK_A5_SC) 판형 기준.
 *
 * - COVER_PAGE: 내지a_cover — 좌측 사진 + 날짜 + 제목 + 짧은 본문
 *   (프로젝트 1개의 첫 페이지로 사용)
 * 
 * - BODY_PAGE: 내지b — 날짜 + 제목 + 긴 본문
 *   (프로젝트의 본문 이어가기 페이지로 반복 사용 가능)
 */
export const DIARY_B_TEMPLATES = {
  COVER_PAGE: '2qld1DLewXv9',
  BODY_PAGE: '3DGPZzdQwVKE',
} as const;

/**
 * 일기장B 내지a_cover 템플릿이 요구하는 파라미터.
 * placeholder 키: photo1, date, title, diaryText (모두 필수)
 */
export interface DiaryCoverPageParams {
  photo1: string;     // 좌측 전체 사진 (파일 업로드 or URL)
  date: string;       // 날짜 텍스트 (ex. 4.9)
  title: string;      // 소제목 ("\n"으로 줄바꿈 가능)
  diaryText: string;  // 일기 본문 텍스트 (내지a는 400자 이내 짧은 버전)
}

/**
 * 일기장B 내지b 템플릿이 요구하는 파라미터.
 * placeholder 키: date, title, diaryText (모두 필수)
 *
 * 본문이 길 경우 이 템플릿을 여러 번 반복 호출하여 페이지를 이어간다.
 * 단, splittable:false이므로 각 호출 시 diaryText는 한 페이지 분량
 * (약 1500자 이내)으로 프론트에서 수동 분할 필요.
 */
export interface DiaryBodyPageParams {
  date: string;
  title: string;
  diaryText: string;  // 일기 본문 텍스트 (1,500자 이내 긴 버전)
}

/**
 * 내지 생성 요청 — BFF에 보내는 페이로드.
 * 프론트는 "한 프로젝트를 구성하는 페이지들의 배열"을 통째로 보낸다.
 */
export type ContentPageRequest =
  | { kind: 'cover'; templateUid: string; parameters: DiaryCoverPageParams }
  | { kind: 'body'; templateUid: string; parameters: DiaryBodyPageParams };

/**
 * 여러 페이지를 한 번에 생성할 때 BFF가 받는 요청.
 * 프론트에서 페이지 배열을 보내면 BFF가 순차 루프로 SDK를 호출한다.
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
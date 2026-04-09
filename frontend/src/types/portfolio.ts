/**
 * 포트폴리오 UI 도메인 모델
 *
 * 이 앱이 편집/표시하는 "나의 개발일지"의 도메인 타입이다.
 * Sweetbook API 스펙과는 독립적으로 정의되며, 외부 API로 보낼 때는
 * utils/portfolioMapper.ts 의 매퍼 함수를 통해 DTO로 변환한다.
 *
 * 분리 이유:
 * - UI는 "프로젝트 하나"를 의미 단위로 다루지만, Sweetbook 템플릿은
 *   year/month/monthNum/... 같은 평평한 placeholder 키 집합을 요구한다.
 * - 템플릿 스펙이 바뀌어도 UI 모델은 영향을 받지 않도록 경계를 둔다.
 */

/* 표지: 개발자 자기소개 정보 */
export interface PortfolioCover {
  developerName: string;  // 개발자 이름
  jobTitle: string;       // 직무
  volumeLabel: string;    // 권 표시
  periodText: string;     // 활동 기간
  coverPhoto: string;     // 표지 대표 이미지
  bio: string;            // 1줄 소개
  techStack: string[];    // 기술 스택
  githubUrl: string;      // GitHub URL
  blogUrl?: string;       // 블로그 or 포트폴리오 사이트
}

/* 프로젝트: 개발일지 한 편 */
export interface PortfolioProject {
  id: string;              // 클라이언트 측 식별자 (순서 변경/삭제 용도)
  projectName: string;     // 프로젝트명
  oneLiner: string;        // 1줄 요약
  role: string;            // 본인 역할
  endDate: string;         // 프로젝트 종료일 (Sweetbook 매퍼가 이 값에서 year/month/date/dayOfWeek 등 6개 필드를 파생)
  projectPeriod: string;   // 프로젝트 기간
  techUsed: string[];      // 사용 기술
  description: string;     // 프로젝트 설명
  achievements: string[];  // 주요 성과
  screenshotUrl: string;   // 대표 스크린샷
  githubUrl?: string;      // GitHub URL
  liveUrl?: string;        // 배포 링크
}

/* 포트폴리오 전체 (표지 + 프로젝트들) */
export interface Portfolio {
  cover: PortfolioCover;
  projects: PortfolioProject[];
}
/* 표지: 개발자 자기소개 정보 */
export interface PortfolioCover {
  developerName: string;  // 개발자 이름
  jobTitle: string;       // 직무
  volumeLabel: string;    // 버전 표시
  periodText: string;     // 활동 기간
  coverPhoto: string;     // 표지 대표 이미지
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
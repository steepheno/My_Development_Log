/**
 * 포트폴리오 더미 데이터
 *
 * 앱 초기 진입 시 Zustand 스토어의 기본값으로 주입된다.
 * 사용자는 곧바로 편집/미리보기/제작 단계로 진행할 수 있다.
 *
 * 주의: 이 데이터는 Sweetbook API 스펙과 무관하게 UI 도메인 모델만 따른다.
 *       API로 보낼 때는 utils/portfolioMapper.ts를 통해 변환된다.
 */

import type { Portfolio } from '../types/portfolio';

/**
 * picsum.photos seed 기반 이미지 생성 헬퍼.
 * 같은 seed는 항상 같은 이미지를 반환하므로 캐싱이 안정적이다.
 */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const mockPortfolio: Portfolio = {
  cover: {
    developerName: '유준선',
    jobTitle: 'Frontend Developer',
    volumeLabel: 'Vol.1',
    periodText: '2025.02 ~ 2026.04',
    coverPhoto: img('devjs-cover', 1200, 1600),
    bio: '데이터에 기반해 사용자 경험을 설계하는 프론트엔드 개발자입니다.',
    techStack: ['React', 'TypeScript', 'Next.js', 'TanStack Query', 'Zustand', 'SCSS Modules'],
    githubUrl: 'https://github.com/steepheno',
    blogUrl: 'https://jsundev.vercel.app',
  },
  projects: [
    {
      id: 'project-dorolaw',
      projectName: 'DOROLAW',
      oneLiner: 'AI 기반 교통사고 과실 비율 분석 플랫폼',
      role: '프론트엔드 리드',
      endDate: '2025-04-11',
      projectPeriod: '2025.02 ~ 2025.04',
      techUsed: ['React', 'TypeScript', 'TanStack Query', 'Zustand', 'SCSS Modules'],
      description:
        'AI가 교통사고 영상을 분석해 과실 비율을 산출하고 변호사 상담으로 연결해주는 플랫폼. 프론트엔드 리드로서 아키텍처와 핵심 기능을 주도했습니다.',
      achievements: [
        'TypeScript 도입으로 API 통합 에러 50% 감소',
        'PDF 분석 리포트 저장 기능 — 스크롤 영역 캡처 이슈를 재귀 스타일 적용으로 해결',
        '비디오 업로드 Zustand 상태 관리 및 진행률 UI 구현',
        'AI 챗봇 FastAPI 연동 및 textarea 동적 높이 조절 구현',
      ],
      screenshotUrl: img('dorolaw-ai', 1200, 800),
      githubUrl: 'https://github.com/steepheno/dorolaw',
    },
    {
      id: 'project-devpilot',
      projectName: 'DevPilot',
      oneLiner: 'CI/CD 배포 자동화 대시보드',
      role: '프론트엔드 개발',
      endDate: '2025-05-22',
      projectPeriod: '2025.04 ~ 2025.05',
      techUsed: ['React', 'TypeScript', 'Jenkins', 'FastAPI'],
      description:
        '1인 개발자와 CI/CD 입문자를 위한 파이프라인 구축 및 배포 자동화 서비스. Jenkins와 유사한 UX를 목표로 구현했습니다.',
      achievements: [
        '복잡한 배포 프로세스를 원클릭 파이프라인 UX로 단순화',
        '팀원의 Wails 최적화로 앱 빌드 사이즈 400MB → 60MB (85% 절감)',
        '실시간 빌드 로그 스트리밍 UI 구현',
      ],
      screenshotUrl: img('devpilot-cicd', 1200, 800),
      githubUrl: 'https://github.com/steepheno/devpilot',
    },
    {
      id: 'project-choice-and-appear',
      projectName: 'Choice & Appear',
      oneLiner: '사업자 등록을 마친 실서비스 온라인 쇼핑몰',
      role: '프론트엔드 개발',
      endDate: '2026-03-13',
      projectPeriod: '2025.11 ~ 2026.03',
      techUsed: ['React', 'TypeScript', 'Zustand', 'TanStack Query', 'SCSS Modules'],
      description:
        'FSD 아키텍처 기반의 온라인 쇼핑몰 서비스. 쿠키 기반 JWT 인증과 axios 인터셉터를 통한 토큰 갱신 플로우를 직접 설계했고, Tiptap 에디터를 활용한 게시판 기능을 구현했습니다.',
      achievements: [
        'axios 인터셉터로 refresh token 자동 갱신 플로우 구축',
        'Zustand persist 미들웨어로 다단계 회원가입 상태 관리',
        'TanStack Query 캐시 정책 설계로 불필요한 리페치 최소화',
        'Tiptap 리치 텍스트 에디터 렌더링 성능 최적화 (re-render 0회)',
      ],
      screenshotUrl: img('cna-shop', 1200, 800),
      githubUrl: 'https://github.com/steepheno/choice-and-appear',
    },
    {
      id: 'project-portfolio-site',
      projectName: 'Web Portfolio',
      oneLiner: 'FSD 아키텍처 기반 개인 포트폴리오 사이트',
      role: '개인 프로젝트',
      endDate: '2026-03-27',
      projectPeriod: '2026.03',
      techUsed: ['React', 'TypeScript', 'React Router', 'SCSS Modules'],
      description:
        'Feature-Sliced Design 아키텍처를 적용한 개인 포트폴리오. 컴포넌트 분해와 스크롤 기반 인터랙션에 중점을 두었습니다.',
      achievements: [
        'FSD 레이어 분리로 features/widgets/shared 구조 정착',
        'useRevealOnScroll 커스텀 훅으로 스크롤 기반 reveal 애니메이션',
        '프로젝트 상세 페이지 진입 후 뒤로가기 시 스크롤 위치 복원',
        'CSS columns를 활용한 이력서 페이지 masonry 레이아웃',
      ],
      screenshotUrl: img('portfolio-site', 1200, 800),
      githubUrl: 'https://github.com/steepheno/portfolio',
      liveUrl: 'https://jsundev.vercel.app',
    },
  ],
};

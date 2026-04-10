import type { PortfolioCover, PortfolioProject } from '../types/portfolio.js';
import {
  DIARY_B_TEMPLATES,
  type CoverTemplateParams,
  type ContentPageRequest,
} from '../types/sweetbookTemplates.js';

// ========== 상수 ========== //

/* 내지a_cover의 diaryText 최대 글자 수 */
const COVER_PAGE_TEXT_LIMIT = 400;

/* 내지b의 diaryText 최대 글자 수 */
const BODY_PAGE_TEXT_LIMIT = 1500;

// ===== 헬퍼 ===== //
function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${isoDate}`);
  }
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/**
 * 긴 본문을 페이지 단위로 분할한다.
 */
function splitTextByLimit(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split('\n\n');
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= limit) {
      current = current ? `${current}\n\n${para}` : para;
    } else {
      if (current) chunks.push(current);
      // 단일 문단이 limit을 초과하면 그대로 푸시 (추후 sentence 단위 분할 고도화 가능)
      current = para;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * 프로젝트의 description + achievements를 하나의 긴 텍스트로 합친다.
 */
function projectToLongText(project: PortfolioProject): string {
  const lines: string[] = [];
  lines.push(project.description);
  lines.push(''); // 빈 줄
  lines.push(`[사용 기술] ${project.techUsed.join(', ')}`);
  lines.push('');
  lines.push('[주요 성과]');
  for (const item of project.achievements) {
    lines.push(`· ${item}`);
  }
  if (project.githubUrl) {
    lines.push('');
    lines.push(`GitHub: ${project.githubUrl}`);
  }
  if (project.liveUrl) {
    lines.push(`Live: ${project.liveUrl}`);
  }
  return lines.join('\n');
}

// ===== 매퍼 ===== //
export function toCoverTemplateParams(cover: PortfolioCover): CoverTemplateParams {
  return {
    childName: cover.developerName,
    schoolName: cover.jobTitle,
    volumeLabel: cover.volumeLabel,
    periodText: cover.periodText,
    coverPhoto: cover.coverPhoto,
  };
}

/* Content 매퍼 — 프로젝트 하나를 여러 페이지 요청으로 변환 */

/**
 * 하나의 프로젝트를 "내지a_cover 1장 + 내지b n장"으로 변환한다.
 */
export function projectToContentPages(project: PortfolioProject): ContentPageRequest[] {
  const date = formatDateShort(project.endDate);
  const title = project.projectName;
  const pages: ContentPageRequest[] = [];

  // 1. 첫 페이지: 사진 + 짧은 요약 (oneLiner + role)
  const coverDiaryText = [project.oneLiner, '', `Role: ${project.role}`, `Period: ${project.projectPeriod}`]
    .join('\n')
    .slice(0, COVER_PAGE_TEXT_LIMIT);

  const coverPage: ContentPageRequest = {
    kind: 'cover',
    templateUid: DIARY_B_TEMPLATES.COVER_PAGE,
    parameters: {
      photo1: project.screenshotUrl,
      date,
      title,
      diaryText: coverDiaryText,
    },
  };
  pages.push(coverPage);

  // 2. 본문 페이지: description + achievements 등을 분할해서 N장
  const longText = projectToLongText(project);
  const chunks = splitTextByLimit(longText, BODY_PAGE_TEXT_LIMIT);

  for (const chunk of chunks) {
    pages.push({
      kind: 'body',
      templateUid: DIARY_B_TEMPLATES.BODY_PAGE,
      parameters: {
        date,
        title,
        diaryText: chunk,
      },
    });
  }

  return pages;
}

/**
 * 여러 프로젝트를 모든 내지 페이지 요청으로 변환한다.
 */
export function projectsToContentPages(projects: PortfolioProject[]): ContentPageRequest[] {
  return projects.flatMap(projectToContentPages);
}

/* ===== 페이지 수 padding ===== */
/**
 * Sweetbook API의 finalize 제약: 페이지 수 50 이상 *
 * 프로젝트가 적을 때 부족한 페이지 수를 빈 일기 페이지로 채움.
 *
 * 설계 의도: 이 책은 "개발 일지"이므로, 완성된 과거 기록(프로젝트 페이지)과
 * 앞으로 채울 빈 일기 공간이 함께 있도록 의도한 컨셉
 *
 * @param pages  매핑된 프로젝트 페이지들
 * @param minTotal  최소 페이지 수 (기본 50)
 * @returns 최소 페이지 수가 보장된 페이지 배열
 */

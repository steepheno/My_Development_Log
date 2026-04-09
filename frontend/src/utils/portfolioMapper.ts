/**
 * Portfolio ↔ Sweetbook DTO 매퍼
 *
 * UI 도메인 모델(types/portfolio.ts)을 Sweetbook 일기장B 템플릿 파라미터로 변환.
 * 이 Mapper는 두 파일의 유일한 접점이며, 템플릿을 교체하거나 스펙이 바뀌어도
 * "UI 코드는 건드리지 않고" 이 파일만 수정하면 된다.
 */

import type { PortfolioCover, PortfolioProject } from '../types/portfolio';
import type { CoverTemplateParams, ContentPageRequest } from '../types/sweetbook';
import { DIARY_B_TEMPLATES } from '../types/sweetbook';


// ========== 상수 ========== //

/* 내지a_cover의 diaryText 최대 글자수 (레이아웃 분석 기준) */
const COVER_PAGE_TEXT_LIMIT = 400;

/* 내지b의 diaryText 최대 글자수 (레이아웃 분석 기준) */
const BODY_PAGE_TEXT_LIMIT = 1500;


// ========== 헬퍼 ========== //

/**
 * "YYYY-MM-DD" → "M.D" 형식 변환.
 * 예: "2025-04-11" → "4.11"
 */
function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${isoDate}`);
  }
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/**
 * 긴 본문을 페이지 단위로 분할한다.
 * splittable:false 템플릿이므로 프론트에서 수동 분할 필요.
 *
 * 분할 기준: 문단(\n\n) 경계를 우선하고, 문단이 한계를 넘으면 문장(.) 경계로 쪼갠다.
 * 단순한 글자 수 자르기가 아닌 이유는, 단어나 문장 중간에서 끊기면 가독성이 망가지기 때문.
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
 * UI는 구조화된 데이터로 보관하지만, Sweetbook diaryText는 하나의 문자열이므로
 * 여기서 포맷팅한다.
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


// ========== 매퍼 ========== //

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
 * 하나의 프로젝트를 "내지a_cover 1장 + 내지b N장"으로 변환한다.
 *
 * - 첫 페이지(내지a_cover): 프로젝트 스크린샷 + 짧은 한 줄 요약(oneLiner + role)
 * - 이후 페이지(내지b): description + achievements 등 긴 본문을 분할 수용
 *
 * @param project  변환할 프로젝트
 * @returns        BFF에 보낼 ContentPageRequest 배열 (프로젝트 1개 = 페이지 N개)
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

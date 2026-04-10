import type { PortfolioProject } from '@/types/portfolio';

export function createEmptyProject(): Omit<PortfolioProject, 'id'> {
  // 종료일 기본값: 오늘 날짜 (YYYY-MM-DD 형식)
  const today = new Date().toISOString().split('T')[0];

  return {
    projectName: '',
    oneLiner: '',
    role: '',
    endDate: today,
    projectPeriod: '',
    techUsed: [],
    description: '',
    achievements: [],
    screenshotUrl: '',
    // githubUrl, liveUrl 은 optional이므로 미포함
  };
}
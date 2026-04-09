/**
 * Portfolio 편집 스토어
 *
 * 사용자가 편집 페이지에서 다루는 포트폴리오 상태를 관리한다.
 * persist 미들웨어로 localStorage에 저장되어 새로고침/재접속 시에도
 * 편집 내용이 복원된다.
 *
 * 관리하지 않는 것:
 * - Sweetbook API 호출 상태(로딩/에러) → BFF 호출 훅에서 관리
 * - Sweetbook 파라미터 변환 결과 → utils/portfolioMapper로 즉시 계산
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Portfolio,
  PortfolioCover,
  PortfolioProject,
} from '../types/portfolio';
import { mockPortfolio } from '../mocks/portfolio';


// ========== 타입 ========== //
/**
 * 편집 페이지에서 "현재 어느 항목을 편집 중인가"를 나타낸다.
 * - 'cover': 표지 편집 중
 * - string (project.id): 특정 프로젝트 편집 중
 * - null: 아무것도 선택되지 않음 (목록만 보는 상태)
 */
export type SelectedItemId = 'cover' | string | null;

/** 스토어 상태 + 액션 */
interface PortfolioStore {
  /* State */
  cover: PortfolioCover;
  projects: PortfolioProject[];
  selectedId: SelectedItemId;

  /* Cover actions */
  updateCover: (patch: Partial<PortfolioCover>) => void;

  /* Project actions */
  // 새 프로젝트를 추가하고 id를 돌려준다 (방금 만든 프로젝트로 바로 이동하기 위함)
  addProject: (project: Omit<PortfolioProject, 'id'>) => string;
  updateProject: (id: string, patch: Partial<PortfolioProject>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  // --- Selection actions ---
  selectItem: (id: SelectedItemId) => void;

  // --- Reset ---
  resetToMock: () => void;
}


// ========== Store ========== //

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      // --- 초기 상태: mockData로 시작 ---
      cover: mockPortfolio.cover,
      projects: mockPortfolio.projects,
      selectedId: 'cover', // 편집 페이지 진입 시 기본적으로 표지가 선택되어 있음

      // --- Cover ---
      updateCover: (patch) =>
        set((state) => ({
          cover: { ...state.cover, ...patch },
        })),

      // --- Projects ---
      addProject: (project) => {
        const id = crypto.randomUUID();
        set((state) => ({
          projects: [...state.projects, { ...project, id }],
          selectedId: id, // 추가한 프로젝트를 바로 선택
        }));
        return id;
      },

      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      removeProject: (id) =>
        set((state) => {
          const nextProjects = state.projects.filter((p) => p.id !== id);
          // 삭제한 프로젝트가 현재 선택 중이었다면 선택을 표지로 되돌린다.
          const nextSelected =
            state.selectedId === id ? 'cover' : state.selectedId;
          return {
            projects: nextProjects,
            selectedId: nextSelected,
          };
        }),

      reorderProjects: (fromIndex, toIndex) =>
        set((state) => {
          if (
            fromIndex < 0 ||
            fromIndex >= state.projects.length ||
            toIndex < 0 ||
            toIndex >= state.projects.length
          ) {
            return state;
          }
          const next = [...state.projects];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { projects: next };
        }),

      // --- Selection ---
      selectItem: (id) => set({ selectedId: id }),

      // --- Reset ---
      resetToMock: () =>
        set({
          cover: mockPortfolio.cover,
          projects: mockPortfolio.projects,
          selectedId: 'cover',
        }),
    }),
    {
      name: 'portfolio-editor', // localStorage key
      // selectedId는 세션 UI 상태라 persist에서 제외한다.
      // 새로고침 후 "직전에 편집 중이던 항목"이 자동 선택되면 오히려 혼란스러울 수 있고,
      // 표지부터 다시 보는 게 자연스러운 진입 경험이다.
      partialize: (state) => ({
        cover: state.cover,
        projects: state.projects,
      }),
    },
  ),
);


// ========== Selectors (파생 상태 조회 헬퍼) ========== //

/**
 * 현재 선택된 프로젝트를 반환한다. 선택된 게 표지거나 아무것도 없으면 null.
 *
 * 사용 예:
 *   const selected = useSelectedProject();
 *   if (!selected) return <CoverEditor />;
 *   return <ProjectEditor project={selected} />;
 */
export function useSelectedProject(): PortfolioProject | null {
  return usePortfolioStore((state) => {
    if (state.selectedId === null || state.selectedId === 'cover') return null;
    return state.projects.find((p) => p.id === state.selectedId) ?? null;
  });
}

/**
 * 현재 전체 Portfolio 객체를 반환한다. Mapper에 넘기거나 미리보기 렌더링 시 사용.
 */
export function usePortfolio(): Portfolio {
  return usePortfolioStore((state) => ({
    cover: state.cover,
    projects: state.projects,
  }));
}
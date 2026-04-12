/**
 * '주문하기' 버튼 클릭 후 진행 상태를 표현하는 모델
 * SSE progress 이벤트를 받아 'pending' → 'active' → 'done'으로 진행
 * contents_insert 단계만 current/total 카운터를 추가로 가진다.
 */

import type { WorkflowProgressEvent } from "@/types/progress";

export type StepStatus = 'pending' | 'active' | 'done';

export interface ChecklistState {
  bookCreate: StepStatus;
  coverCreate: StepStatus;
  contentsInsert: StepStatus;
  contentsCurrent: number;
  contentsTotal: number;
  finalize: StepStatus;
  orderCreate: StepStatus;
}

export const initialChecklistState: ChecklistState = {
  bookCreate: 'pending',
  coverCreate: 'pending',
  contentsInsert: 'pending',
  contentsCurrent: 0,
  contentsTotal: 0,
  finalize: 'pending',
  orderCreate: 'pending',
};

/**
 * SSE progress 이벤트 하나를 받아 ChecklistState를 갱신
 *
 * 순수 함수로 만들어서 useState updater에 그대로 넘길 수 있게 함.
 */

export function reduceChecklist(
  state: ChecklistState,
  event: WorkflowProgressEvent
): ChecklistState {
  switch (event.step) {
    case 'book_create':
      return { ...state, bookCreate: event.status === 'done' ? 'done' : 'active' };

    case 'cover_create':
      return { ...state, coverCreate: event.status === 'done' ? 'done' : 'active' };

    case 'contents_insert':
      if (event.status === 'start') {
        return { ...state, contentsInsert: 'active', contentsTotal: event.total, contentsCurrent: 0 };
      }
      if (event.status === 'progress') {
        return { ...state, contentsInsert: 'active', contentsCurrent: event.current, contentsTotal: event.total };
      }
      // status === 'done'
      return { ...state, contentsInsert: 'done' };

    case 'finalize':
      return { ...state, finalize: event.status === 'done' ? 'done' : 'active' };

    case 'order_create':
      return { ...state, orderCreate: event.status === 'done' ? 'done' : 'active' };

    default:
      return state;
  }
}
/**
 * Toast 알림 래퍼
 * 호출부가 메시지와 스타일을 직접 다루지 않도록 의미 단위로 감싼다.
 */

import axios from 'axios';
import toast from 'react-hot-toast';

/* ===== BFF 에러 응답 타입 ===== */
type BffErrorCode =
  | 'VALIDATION_FAILED'
  | 'INSUFFICIENT_CREDITS'
  | 'SWEETBOOK_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR';

interface BffErrorResponse {
  success: false;
  code: BffErrorCode;
  error: string; // BFF가 응답하는 한국어 메시지
  details?: unknown;
}

function isBffErrorResponse(value: unknown): value is BffErrorResponse {
  return (
    !!value &&
    typeof value === 'object' &&
    'code' in value &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'string'
  );
}

/**
 * 임의의 에러에서 BFF 에러 응답을 추출
 * - axios 에러: err.response.data
 * - 기타 (네트워크 단절, JSON 파싱 실패 등): null
 */

function extractBffError(error: unknown): BffErrorResponse | null {
  // axios 에러
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (isBffErrorResponse(data)) {
      return data;
    }

    return null;
  }

  // 직접 throw한 BFF 응답 객체
  if (isBffErrorResponse(error)) {
    return error;
  }

  return null;
}

export const notify = {
  /* ===== 입력 검증 ===== */
  // 에러를 요약한 toast로 안내
  validationFailed(errorCount: number) {
    toast.error(`입력하지 않은 항목이 ${errorCount}개 있어요.`);
  },

  /* ===== BFF 성공 ===== */
  // 주문 생성
  orderCreated() {
    toast.success('주문이 완료됐어요!');
  },

  /* ===== BFF 에러 ===== */
  orderFailed(error: unknown) {
    const bffError = extractBffError(error);

    // BFF 응답이 없으면 → 네트워크 단절 등으로 요청 자체가 실패
    if (!bffError) {
      toast.error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
      return;
    }

    toast.error(bffError.error);  // BFF가 응답한 한국어 에러 메시지

    // 충전금 부족은 추가 안내가 필요할 수도 있으니 별도 처리 여지
    // (지금은 BFF 메시지로 충분하면 그대로 두기)
  },

  /* ===== 편집 ===== */
  projectReordered() {
    toast.success('프로젝트 순서가 변경되었어요.', { duration: 1500 });
  },
};

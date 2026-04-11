/**
 * Toast 알림 래퍼
 * 호출부가 메시지와 스타일을 직접 다루지 않도록 의미 단위로 감싼다.
 */

import toast from 'react-hot-toast';

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

  // 주문 생성 실패
  orderFailed(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : '주문 처리 중 문제가 발생했어요.';
    toast.error(message);
  },
};
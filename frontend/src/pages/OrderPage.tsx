import style from './OrderPage.module.scss';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createOrder } from '@/api/orders';
import { usePortfolioStore } from '@/store/portfolioStore';

import { defaultShipping, type ShippingInfo } from '@/mocks/defaultShipping';
import { ShippingForm } from '@/components/order/ShippingForm';
import { validateShipping, type FormErrors } from '@/components/order/validateShipping';
import { Button } from '@/components/button/Button';
import { LinkButton } from '@/components/button/LinkButton';

type OrderViewState = 'form' | 'submitting' | 'error';

// 주문 성공 시 주문 완료 페이지로 넘길 데이터
export interface OrderResult {
  orderUid: string;
  recipientName: string;
  address1: string;
  address2: string;
}

export function OrderPage() {
  const navigate = useNavigate();
  const cover = usePortfolioStore(s => s.cover);
  const projects = usePortfolioStore(s => s.projects);

  const [viewState, setViewState] = useState<OrderViewState>('form');
  const [shipping, setShipping] = useState<ShippingInfo>(defaultShipping);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');

  /* ===== 빈 상태 방어 ===== */
  if (projects.length === 0) {
    return (
      <div className={style.page}>
        <div className={style.empty}>
          <div className={style.emptyIcon}>📭</div>
          <h2 className={style.emptyTitle}>주문할 프로젝트가 없어요</h2>
          <p className={style.emptyDescription}>편집 페이지에서 프로젝트를 추가한 뒤 다시 시도해주세요.</p>
          <Link
            to="/edit"
            className={style.emptyLink}
          >
            편집 페이지로
          </Link>
        </div>
      </div>
    );
  }

  // ===== 폼 입력 핸들러 =====
  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /* ===== 제출 핸들러 ===== */
  const handleSubmit = async () => {
    // 1. 폼 검증
    const validationErrors = validateShipping(shipping);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 2. API 호출
    setViewState('submitting');
    setApiError('');

    try {
    // BFF 호출 — 책 생성부터 주문까지 한 번에 처리 (약 30~35초 소요)
    const { orderUid } = await createOrder({
      portfolio: { cover, projects },
      shipping,
    });

    // 완료 페이지로 넘길 데이터 (BFF가 알려준 orderUid + 폼에서 입력한 shipping 데이터)
    const result: OrderResult = {
      orderUid,
      recipientName: shipping.recipientName,
      address1: shipping.address1,
      address2: shipping.address2,
    };

    navigate('/complete', { state: result, replace: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.';
    setApiError(message);
    setViewState('error');
  }
  };

  /* ===== 재시도 핸들러 ===== */
  const handleRetry = () => {
    setViewState('form');
    setApiError('');
  };

  /* ===== 렌더링: 에러 화면 ===== */
  if (viewState === 'error') {
    return (
      <div className={style.page}>
        <div className={style.errorBox}>
          <div className={style.errorIcon}>!</div>
          <h1 className={style.errorTitle}>주문 처리 중 오류가 발생했어요</h1>
          <p className={style.errorDescription}>{apiError}</p>
          <div className={style.errorActions}>
            <Button
              variant="primary"
              onClick={handleRetry}
            >
              다시 시도
            </Button>
            <LinkButton
              variant="secondary"
              to="/preview"
            >
              미리보기로 돌아가기
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  /* ===== 렌더링: 폼 / 제출 중 화면 ===== */
  const isSubmitting = viewState === 'submitting';

  return (
    <div className={style.page}>
      <header className={style.header}>
        <h1 className={style.title}>주문하기</h1>
        <p className={style.subtitle}>배송지를 확인하고 주문을 완료해주세요</p>
      </header>

      <ShippingForm
        value={shipping}
        onChange={handleShippingChange}
        errors={errors}
        disabled={isSubmitting}
      />

      {/* 액션 버튼 */}
      <div className={style.actions}>
        <LinkButton
          variant="secondary"
          to="/preview"
          disabled={isSubmitting}
        >
          ← 뒤로가기
        </LinkButton>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '주문 중…' : '주문하기 →'}
        </Button>
      </div>
    </div>
  );
}

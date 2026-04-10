import style from './OrderPage.module.scss';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolioStore';
import { defaultShipping, type ShippingInfo } from '../mocks/defaultShipping';
import { Button } from '@/components/button/Button';
import { LinkButton } from '@/components/button/LinkButton';

type OrderViewState = 'form' | 'submitting' | 'error';

// 주문 성공 시 주문 완료 페이지로 넘길 데이터
export interface OrderResult {
  orderUid: string;
  totalAmount: number;
  recipientName: string;
  address1: string;
  address2: string;
}

// 폼 에러 검증
type FormErrors = Partial<Record<keyof ShippingInfo, string>>;

/* 폼 검증 함수 */
function validateShipping(shipping: ShippingInfo): FormErrors {
  const errors: FormErrors = {};

  if (shipping.recipientName.trim().length < 2) {
    errors.recipientName = '이름을 2자 이상 입력해주세요.';
  }

  const phoneDigits = shipping.recipientPhone.replace(/-/g, '');
  if (!/^\d{9,11}$/.test(phoneDigits)) {
    errors.recipientPhone = '올바른 연락처 형식이 아니에요.';
  }

  if (!/^\d{5}$/.test(shipping.postalCode)) {
    errors.postalCode = '우편번호는 5자리 숫자여야 해요.';
  }

  if (shipping.address1.trim().length < 5) {
    errors.address1 = '주소를 입력해주세요.';
  }

  return errors;
}

// ===== Mock API 호출 =====
async function submitOrderMock(shipping: ShippingInfo): Promise<OrderResult> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    orderUid: `or_${Math.random().toString(36).slice(2, 14)}`,
    totalAmount: 63400,
    recipientName: shipping.recipientName,
    address1: shipping.address1,
    address2: shipping.address2,
  };
}

export function OrderPage() {
  const navigate = useNavigate();
  const projects = usePortfolioStore(s => s.projects);

  const [viewState, setViewState] = useState<OrderViewState>('form');
  const [shipping, setShipping] = useState<ShippingInfo>(defaultShipping);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');

  // ===== 빈 상태 방어 =====
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
            편집 페이지로 가기
          </Link>
        </div>
      </div>
    );
  }

  // ===== 폼 입력 핸들러 =====
  const handleChange =
    (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setShipping(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  // ===== 제출 핸들러 =====
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
      const result = await submitOrderMock(shipping);
      // 성공 시 /complete로 이동, result는 location.state로 전달
      // replace: true → 뒤로가기 시 /order가 아닌 /preview로 가도록
      navigate('/complete', { state: result, replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.';
      setApiError(message);
      setViewState('error');
    }
  };

  // ===== 재시도 핸들러 =====
  const handleRetry = () => {
    setViewState('form');
    setApiError('');
  };

  // ===== 렌더링: 에러 화면 =====
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

  // ===== 렌더링: 폼 / 제출 중 화면 =====
  const isSubmitting = viewState === 'submitting';

  return (
    <div className={style.page}>
      <header className={style.header}>
        <h1 className={style.title}>주문하기</h1>
        <p className={style.subtitle}>배송지를 확인하고 주문을 완료해주세요</p>
      </header>

      <div className={style.formSection}>
        <h2 className={style.sectionTitle}>배송지 정보</h2>

        <div className={style.formGrid}>
          {/* 수령인 이름 */}
          <div className={style.field}>
            <label
              htmlFor="recipientName"
              className={style.label}
            >
              수령인 <span className={style.required}>*</span>
            </label>
            <input
              id="recipientName"
              type="text"
              value={shipping.recipientName}
              onChange={handleChange('recipientName')}
              disabled={isSubmitting}
              className={`${style.input} ${errors.recipientName ? style.inputError : ''}`}
              maxLength={100}
            />
            {errors.recipientName && <span className={style.errorMessage}>{errors.recipientName}</span>}
          </div>

          {/* 연락처 */}
          <div className={style.field}>
            <label
              htmlFor="recipientPhone"
              className={style.label}
            >
              연락처 <span className={style.required}>*</span>
            </label>
            <input
              id="recipientPhone"
              type="tel"
              value={shipping.recipientPhone}
              onChange={handleChange('recipientPhone')}
              disabled={isSubmitting}
              className={`${style.input} ${errors.recipientPhone ? style.inputError : ''}`}
              placeholder="010-0000-0000"
              maxLength={20}
            />
            {errors.recipientPhone && <span className={style.errorMessage}>{errors.recipientPhone}</span>}
          </div>

          {/* 우편번호 */}
          <div className={style.field}>
            <label
              htmlFor="postalCode"
              className={style.label}
            >
              우편번호 <span className={style.required}>*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              inputMode="numeric"
              value={shipping.postalCode}
              onChange={handleChange('postalCode')}
              disabled={isSubmitting}
              className={`${style.input} ${style.inputShort} ${errors.postalCode ? style.inputError : ''}`}
              placeholder="00000"
              maxLength={5}
            />
            {errors.postalCode && <span className={style.errorMessage}>{errors.postalCode}</span>}
          </div>

          {/* 주소 */}
          <div className={style.field}>
            <label
              htmlFor="address1"
              className={style.label}
            >
              주소 <span className={style.required}>*</span>
            </label>
            <input
              id="address1"
              type="text"
              value={shipping.address1}
              onChange={handleChange('address1')}
              disabled={isSubmitting}
              className={`${style.input} ${errors.address1 ? style.inputError : ''}`}
              maxLength={200}
            />
            {errors.address1 && <span className={style.errorMessage}>{errors.address1}</span>}
          </div>

          {/* 상세주소 */}
          <div className={style.field}>
            <label
              htmlFor="address2"
              className={style.label}
            >
              상세주소
            </label>
            <input
              id="address2"
              type="text"
              value={shipping.address2}
              onChange={handleChange('address2')}
              disabled={isSubmitting}
              className={style.input}
              maxLength={200}
            />
          </div>

          {/* 배송 메모 */}
          <div className={style.field}>
            <label
              htmlFor="memo"
              className={style.label}
            >
              배송 메모
            </label>
            <textarea
              id="memo"
              value={shipping.memo}
              onChange={handleChange('memo')}
              disabled={isSubmitting}
              className={style.textarea}
              placeholder="부재 시 경비실에 맡겨주세요"
              maxLength={200}
              rows={2}
            />
          </div>
        </div>
      </div>

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

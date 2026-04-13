import style from './OrderPage.module.scss';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createOrderStream, isUnrecoverableStreamError } from '@/api/orders';
import { usePortfolioStore } from '@/store/portfolioStore';
import { notify } from '@/lib/notify';

import { defaultShipping, type ShippingInfo } from '@/mocks/defaultShipping';
import { ShippingForm } from '@/components/order/ShippingForm';
import { validateShipping, type FormErrors } from '@/components/order/validateShipping';

import { ProgressChecklist } from '@/components/order/ProgressChecklist';
import { initialChecklistState, reduceChecklist, type ChecklistState } from '@/components/order/checklistState';

import { Button } from '@/components/button/Button';
import { LinkButton } from '@/components/button/LinkButton';
import toast from 'react-hot-toast';

type OrderViewState = 'form' | 'submitting' | 'failed_unrecoverable';

// 주문 성공 시 주문 완료 페이지로 넘길 데이터
export interface OrderResult {
  orderUid: string;
  bookUid: string;
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
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklistState);
  const [bookUid, setBookUid] = useState<string | null>(null);

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

  /* ===== 폼 입력 핸들러 ===== */
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
    const errorCount = Object.keys(validationErrors).length;

    // Error 발생 시 toast 안내
    if (errorCount > 0) {
      setErrors(validationErrors);
      notify.validationFailed(errorCount);
      return;
    }

    // 2. 체크리스트 초기화 + 제출 상태 진입
    setChecklist(initialChecklistState);
    setViewState('submitting');

    // 3. SSE 스트림 시작
    try {
      const { orderUid, bookUid: createdBookUid } = await createOrderStream(
        { portfolio: { cover, projects }, shipping },
        // 진행 이벤트 콜백 — reduceChecklist로 새 상태 계산
        event => {
          if (event.step === 'book_create' && event.status === 'done') {
            setBookUid(event.bookUid);
          }
          setChecklist(prev => reduceChecklist(prev, event));
        }
      );

      const result: OrderResult = {
        orderUid,
        bookUid: createdBookUid,
        recipientName: shipping.recipientName,
        address1: shipping.address1,
        address2: shipping.address2,
      };

      notify.orderCreated();
      navigate('/complete', { state: result, replace: true });
    } catch (error) {
      notify.orderFailed(error);

      // 스트림 중단은 재시도 금지 → 전용 뷰로
      // 그 외는 폼으로 복귀하여 재시도 허용
      if (isUnrecoverableStreamError(error)) {
        setViewState('failed_unrecoverable');
      } else {
        setViewState('form');
      }
    }
  };

  /* ===== 렌더링 ===== */
  const isSubmitting = viewState === 'submitting';
  const isUnrecoverable = viewState === 'failed_unrecoverable';

  return (
    <div className={style.page}>
      {isSubmitting && <ProgressChecklist state={checklist} />}

      {isUnrecoverable && (
        <div className={style.unrecoverable}>
          <div className={style.unrecoverableIcon}>⚠️</div>
          <h2 className={style.unrecoverableTitle}>주문 처리 중 문제가 발생했어요.</h2>
          <p className={style.unrecoverableDescription}>
            포토북 제작이 이미 시작됐을 수도 있어요.
            <br />
            다시 주문하지 마시고 화면 캡처 후 고객센터로 문의해주세요.
          </p>

          {bookUid && (
            <div className={style.bookUidBox}>
              <span className={style.bookUidLabel}>책 아이디: </span>
              <code className={style.bookUidValue}>{bookUid}</code>
              <button
                type="button"
                className={style.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(bookUid);
                  toast.success('복사되었습니다.');
                }}
              >
                복사
              </button>
            </div>
          )}
          <LinkButton
            variant="primary"
            to="/"
          >
            홈으로
          </LinkButton>
        </div>
      )}

      {viewState === 'form' && (
        <>
          <header className={style.header}>
            <h1 className={style.title}>주문하기</h1>
            <p className={style.subtitle}>배송지를 확인하고 주문을 완료해주세요</p>
          </header>

          <ShippingForm
            value={shipping}
            onChange={handleShippingChange}
            errors={errors}
            disabled={false}
          />

          <div className={style.actions}>
            <LinkButton
              variant="secondary"
              to="/preview"
            >
              ← 뒤로가기
            </LinkButton>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              주문하기 →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

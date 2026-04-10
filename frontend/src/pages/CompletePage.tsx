import style from './CompletePage.module.scss';
import { useLocation, Navigate } from 'react-router-dom';
import type { OrderResult } from './OrderPage';
import { LinkButton } from '@/components/button/LinkButton';

/**
 * 방어 로직: location.state가 없으면 홈으로 리다이렉트 됨.
 * - 사용자가 URL을 직접 입력해서 /complete에 접근한 경우
 * - /complete 페이지에서 새로고침 (location.state는 새로고침 시 사라짐)
 * - 외부에서 /complete 링크로 들어온 경우
 */

export function CompletePage() {
  const location = useLocation();
  const orderResult = location.state as OrderResult | null;

  // 방어: 주문 결과가 없으면 홈으로
  if (!orderResult) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <div className={style.page}>
      <div className={style.successBox}>
        <div className={style.successIcon}>✓</div>
        <h1 className={style.successTitle}>주문이 완료되었어요</h1>
        <p className={style.successDescription}>포토북 제작 요청이 정상적으로 접수되었어요.</p>

        <div className={style.orderDetails}>
          <div className={style.detailRow}>
            <span className={style.detailLabel}>주문 번호</span>
            <span className={style.detailValueMono}>{orderResult.orderUid}</span>
          </div>
          <div className={style.detailRow}>
            <span className={style.detailLabel}>결제 금액</span>
            <span className={style.detailValue}>{orderResult.totalAmount.toLocaleString()}원</span>
          </div>
          <div className={style.detailRow}>
            <span className={style.detailLabel}>수령인</span>
            <span className={style.detailValue}>{orderResult.recipientName}</span>
          </div>
          <div className={style.detailRow}>
            <span className={style.detailLabel}>배송지</span>
            <span className={style.detailValue}>
              {orderResult.address1}
              {orderResult.address2 && ` ${orderResult.address2}`}
            </span>
          </div>
        </div>

        <div className={style.actions}>
          <LinkButton
            variant="primary"
            to="/"
          >
            처음으로
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

/**
 * 주문 페이지 폼 기본값
 *
 * "실행 직후 서비스를 바로 확인할 수 있도록" 요구사항을 주문 페이지에 적용하기 위한 더미 배송지.
 * Sweetbook API 문서와 SDK 예제에서 쓰이는 예시 값을 그대로 사용한다.
 */

export interface ShippingInfo {
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address1: string;
  address2: string;
  memo: string;
}

export const defaultShipping: ShippingInfo = {
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  postalCode: '06100',
  address1: '서울시 강남구 테헤란로 123',
  address2: '4층 401호',
  memo: '',
};
import type { ShippingInfo } from '@/mocks/defaultShipping';

// 폼 에러 타입: 각 필드별 에러 메시지
export type FormErrors = Partial<Record<keyof ShippingInfo, string>>;

/* ===== 배송지 Form 검증 */
export function validateShipping(shipping: ShippingInfo): FormErrors {
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
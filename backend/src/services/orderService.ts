import type { ShippingInfo } from '../types/shipping.js';
import { randomUUID } from 'crypto';
import { sweetbook } from './sweetbookClient.js';

export interface CreateOrderResult {
  orderUid: string;
  externalRef: string;
}

/**
 * finalize된 책으로 주문 생성
 */

export async function createOrderForBook(
  bookUid: string,
  shipping: ShippingInfo
): Promise<CreateOrderResult> {
  console.log('[orderService] Creating order...');

  // 프론트의 ShippingInfo → SDK shipping 형식 매핑
  const sdkShipping = {
    recipientName: shipping.recipientName,
    recipientPhone: shipping.recipientPhone,
    postalCode: shipping.postalCode,
    address1: shipping.address1,
    address2: shipping.address2,
    shippingMemo: shipping.memo,
  };

  // externalRef: BFF 측 식별자 (디버깅 및 추적용)
  const externalRef = `dev-diary-${Date.now()}-${randomUUID().slice(0, 8)}`;

  const order = await sweetbook.orders.create({
    items: [{ bookUid, quantity: 1 }],
    shipping: sdkShipping,
    externalRef,
  });
  console.log(`[orderService] Order created: ${order.orderUid}`);

  return {
    orderUid: order.orderUid,
    externalRef,
  };
}
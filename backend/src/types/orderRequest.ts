import type { Portfolio } from './portfolio.js';
import type { ShippingInfo } from './shipping.js';

export interface CreateOrderRequest {
  portfolio: Portfolio;
  shipping: ShippingInfo;
}
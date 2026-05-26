export type DiscountTypeValue = 'PERCENT' | 'FIXED';

export interface CreateShopDiscountRequest {
  type: DiscountTypeValue;
  value: number;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
}

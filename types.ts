
export enum TierLevel {
  BRONZE = '小天使',
  SILVER = '守護神',
  GOLD = '超級英雄'
}

export interface SubscriptionTier {
  id: string;
  name: TierLevel;
  price: number;
  description: string;
  perks: string[];
  color: string;
}

export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  tier?: TierLevel;
}

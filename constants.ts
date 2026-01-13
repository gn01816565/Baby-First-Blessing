
import { SubscriptionTier, TierLevel } from './types';

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'tier-1',
    name: TierLevel.BRONZE,
    price: 500,
    description: '基礎尿布與奶粉贊助方案',
    perks: ['每月獲得寶貝超音波更新', '專屬Line群組邀請', '第一時間獲得出生通知'],
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'tier-2',
    name: TierLevel.SILVER,
    price: 1500,
    description: '成長與教育守護方案',
    perks: ['所有小天使權益', '寶貝滿月禮盒優先配送', '每季一次寶貝成長影片'],
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'tier-3',
    name: TierLevel.GOLD,
    price: 3000,
    description: '夢想啟航終極贊助方案',
    perks: ['所有守護神權益', '寶貝乾媽/乾爹證書', '每年生日聚餐優先保留位', '寶貝第一聲乾爹/乾媽特輯'],
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export const INITIAL_MESSAGES = [
  { id: '1', author: '隔壁阿明', content: '等不及要見到小寶貝了！', timestamp: new Date(), tier: TierLevel.GOLD },
  { id: '2', author: '美美阿姨', content: '乾媽費已準備好，快點健康長大喔！', timestamp: new Date(), tier: TierLevel.SILVER }
];

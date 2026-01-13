
import { SubscriptionTier, TierLevel } from './types';

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'tier-1',
    name: TierLevel.BRONZE,
    price: 500,
    description: '基礎尿布與奶粉贊助方案，給滿寶最實質的應援。',
    perks: ['每月獲得滿寶最新超音波記錄', '加入滿寶專屬Line成長群組', '第一時間獲得滿寶出生通知'],
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'tier-2',
    name: TierLevel.SILVER,
    price: 1500,
    description: '成長與教育守護方案，陪伴滿寶探索世界。',
    perks: ['所有小天使權益', '滿寶滿月禮盒優先配送', '每季一次滿寶精選成長影片', '滿寶專屬感謝卡'],
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'tier-3',
    name: TierLevel.GOLD,
    price: 3000,
    description: '夢想啟航終極方案，成為滿寶生命中最堅強的後盾。',
    perks: ['所有守護神權益', '滿寶乾媽/乾爹專屬證書', '每年生日聚餐優先保留位', '滿寶學講話第一聲乾爹/乾媽特輯'],
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export const INITIAL_MESSAGES = [
  { id: '1', author: '隔壁阿明', content: '等不及要見到可愛的滿寶了！', timestamp: new Date(), tier: TierLevel.GOLD },
  { id: '2', author: '美美阿姨', content: '乾媽費已準備好，滿寶要乖乖在肚子裡長大喔！', timestamp: new Date(), tier: TierLevel.SILVER }
];


export interface ReferralProgram {
  referralCode: string;
  referralsCount: number;
  tiers: ReferralTier[];
  rewards: RewardHistory[];
  leaderboardPosition?: number;
}

export interface ReferralTier {
  level: number;
  requiredReferrals: number;
  rewardType: 'badge' | 'cash' | 'premium';
  rewardDescription: string;
  rewardIcon: string;
  isUnlocked: boolean;
}

export interface RewardHistory {
  id: string;
  tierId: number;
  rewardType: 'badge' | 'cash' | 'premium';
  rewardDescription: string;
  dateAwarded: string;
  redeemed: boolean;
}

export interface LeaderboardEntry {
  position: number;
  anonymousAlias: string;
  avatarEmoji: string;
  referralsCount: number;
  userId: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  nextMilestone: number;
  currentTier: number;
}

export type PaymentMethod = 'paypal' | 'venmo' | 'giftcard';

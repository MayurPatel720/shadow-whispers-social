
import { ReferralProgram, ReferralStats, LeaderboardEntry } from '@/types/referral';

export type ReferralResponse = {
  success: boolean;
  message?: string;
};

export type ClaimRewardResponse = {
  success: boolean;
  message: string;
  reward?: {
    tierLevel: number;
    rewardType: 'badge' | 'cash' | 'premium';
    status: 'pending' | 'completed';
  };
};

export type {
  ReferralProgram,
  ReferralStats,
  LeaderboardEntry,
};

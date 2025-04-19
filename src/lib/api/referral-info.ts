
import { api } from '@/lib/api';
import { generateStableCode } from '../utils/referral-code';
import type { ReferralProgram, ReferralStats } from '../types/referral-api.types';

export const getUserReferralInfo = async (): Promise<ReferralProgram> => {
  try {
    const userResponse = await api.get('/api/users/profile');
    const user = userResponse.data;

    const referralCode = user._id ? generateStableCode(user._id) : 'SAMPLE';
    const referralsCount = user.referralCount || 0;

    const referralProgram: ReferralProgram = {
      referralCode,
      referralsCount,
      tiers: [
        {
          level: 1,
          requiredReferrals: 5,
          rewardType: 'badge',
          rewardDescription: 'Shadow Recruiter Badge',
          rewardIcon: '🥷',
          isUnlocked: referralsCount >= 5,
        },
        {
          level: 2,
          requiredReferrals: 10,
          rewardType: 'cash',
          rewardDescription: '₹100 Cash Reward',
          rewardIcon: '💰',
          isUnlocked: referralsCount >= 10,
        },
        {
          level: 3,
          requiredReferrals: 20,
          rewardType: 'premium',
          rewardDescription: 'Premium Features Access',
          rewardIcon: '⭐',
          isUnlocked: referralsCount >= 20,
        },
      ],
      claimedRewards: user.claimedRewards || [],
      leaderboardPosition: 0,
    };

    const leaderboard = await getReferralLeaderboard();
    const userPosition = leaderboard.findIndex((entry) => entry.userId === user._id) + 1;
    if (userPosition > 0) {
      referralProgram.leaderboardPosition = userPosition;
    }

    return referralProgram;
  } catch (error) {
    console.error('Error fetching referral info:', error);
    throw error;
  }
};

export const getReferralStats = async (): Promise<ReferralStats> => {
  try {
    const userResponse = await api.get('/api/users/profile');
    const user = userResponse.data;
    const referralsCount = user.referralCount || 0;

    const nextMilestone = referralsCount < 5 ? 5 : referralsCount < 10 ? 10 : referralsCount < 20 ? 20 : 25;
    const currentTier = referralsCount < 5 ? 0 : referralsCount < 10 ? 1 : referralsCount < 20 ? 2 : 3;

    return {
      totalReferrals: referralsCount,
      pendingReferrals: Math.min(1, Math.floor(referralsCount / 5)),
      completedReferrals: referralsCount - Math.min(1, Math.floor(referralsCount / 5)),
      nextMilestone,
      currentTier,
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    throw error;
  }
};

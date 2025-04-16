
import api from './api';
import { LeaderboardEntry, PaymentMethod, ReferralProgram, ReferralStats } from '@/types/referral';

// Get user's referral information
export const getUserReferralInfo = async (): Promise<ReferralProgram> => {
  try {
    // This would normally be an API call to fetch data from the server
    // For now, we'll return mock data
    const mockReferralProgram: ReferralProgram = {
      referralCode: `${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referralsCount: 3,
      tiers: [
        {
          level: 1,
          requiredReferrals: 5,
          rewardType: 'badge',
          rewardDescription: 'Shadow Recruiter Badge',
          rewardIcon: '🥷',
          isUnlocked: false
        },
        {
          level: 2,
          requiredReferrals: 10,
          rewardType: 'cash',
          rewardDescription: '$100 Cash Reward',
          rewardIcon: '💰',
          isUnlocked: false
        },
        {
          level: 3,
          requiredReferrals: 20,
          rewardType: 'premium',
          rewardDescription: 'Premium Features Access',
          rewardIcon: '⭐',
          isUnlocked: false
        }
      ],
      rewards: [],
      leaderboardPosition: 5
    };
    
    // Update which tiers are unlocked
    mockReferralProgram.tiers = mockReferralProgram.tiers.map(tier => ({
      ...tier,
      isUnlocked: mockReferralProgram.referralsCount >= tier.requiredReferrals
    }));
    
    return mockReferralProgram;
  } catch (error) {
    console.error('Error fetching referral info:', error);
    throw error;
  }
};

// Get referral leaderboard
export const getReferralLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // Mock leaderboard data
    return [
      { position: 1, anonymousAlias: 'ShadowMaster', avatarEmoji: '🦹', referralsCount: 28, userId: '1' },
      { position: 2, anonymousAlias: 'PhantomWhisperer', avatarEmoji: '👻', referralsCount: 23, userId: '2' },
      { position: 3, anonymousAlias: 'MysticGhost', avatarEmoji: '🧙', referralsCount: 19, userId: '3' },
      { position: 4, anonymousAlias: 'NebulaHunter', avatarEmoji: '🌌', referralsCount: 16, userId: '4' },
      { position: 5, anonymousAlias: 'VoidWalker', avatarEmoji: '🎭', referralsCount: 12, userId: '5' },
      { position: 6, anonymousAlias: 'CrypticRaven', avatarEmoji: '🦅', referralsCount: 9, userId: '6' },
      { position: 7, anonymousAlias: 'EnigmaSpecter', avatarEmoji: '🔮', referralsCount: 7, userId: '7' },
      { position: 8, anonymousAlias: 'SilentFox', avatarEmoji: '🦊', referralsCount: 5, userId: '8' },
      { position: 9, anonymousAlias: 'VeiledSerpent', avatarEmoji: '🐍', referralsCount: 3, userId: '9' },
      { position: 10, anonymousAlias: 'MoonShadow', avatarEmoji: '🌙', referralsCount: 2, userId: '10' }
    ];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// Get referral statistics
export const getReferralStats = async (): Promise<ReferralStats> => {
  try {
    // Mock statistics data
    return {
      totalReferrals: 3,
      pendingReferrals: 1,
      completedReferrals: 2,
      nextMilestone: 5,
      currentTier: 0
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    throw error;
  }
};

// Claim a reward
export const claimReward = async (tierId: number, paymentMethod?: PaymentMethod): Promise<{ success: boolean; message: string }> => {
  try {
    // Mock API call for claiming reward
    return { 
      success: true, 
      message: 'Reward claimed successfully! You will receive it within 3-5 business days.' 
    };
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
};

// Share referral code to a specific platform
export const trackReferralShare = async (platform: string): Promise<void> => {
  try {
    // Mock API call for tracking shares
    console.log(`Shared referral code to ${platform}`);
    return;
  } catch (error) {
    console.error('Error tracking referral share:', error);
    throw error;
  }
};


import api from './api';
import { LeaderboardEntry, PaymentMethod, ReferralProgram, ReferralStats } from '@/types/referral';
import { useAuth } from '@/context/AuthContext';

// Get user's referral information
export const getUserReferralInfo = async (): Promise<ReferralProgram> => {
  try {
    // In a real implementation, we would call the API
    // For now, generate a stable referral code based on user ID or email
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Generate a deterministic code based on user ID or email
    // This ensures the same user always gets the same referral code
    const generateStableCode = (input: string) => {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // Convert to alphanumeric code of 6 characters
      const baseCode = Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
      // Ensure it's exactly 6 characters by padding if needed
      return baseCode.padEnd(6, '0');
    };
    
    // Get a stable referral code based on user email or ID
    const stableCode = user._id ? 
      generateStableCode(user._id) : 
      (user.email ? generateStableCode(user.email) : 'SAMPLE');
      
    // Check localStorage to see if this user has referred anyone
    // In a real app, this would come from the backend
    const storedReferrals = localStorage.getItem('referralCounts') || '{}';
    const referralCounts = JSON.parse(storedReferrals);
    
    // Get this user's count or default to 0
    const userReferralsCount = user._id && referralCounts[user._id] ? 
      referralCounts[user._id] : 0;
    
    const mockReferralProgram: ReferralProgram = {
      referralCode: stableCode,
      referralsCount: userReferralsCount,
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
          rewardDescription: '₹100 Cash Reward',
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
    
    // Update which tiers are unlocked based on actual referral count
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
    // Mock leaderboard data with lower counts to better match a new app
    return [
      { position: 1, anonymousAlias: 'ShadowMaster', avatarEmoji: '🦹', referralsCount: 8, userId: '1' },
      { position: 2, anonymousAlias: 'PhantomWhisperer', avatarEmoji: '👻', referralsCount: 6, userId: '2' },
      { position: 3, anonymousAlias: 'MysticGhost', avatarEmoji: '🧙', referralsCount: 4, userId: '3' },
      { position: 4, anonymousAlias: 'NebulaHunter', avatarEmoji: '🌌', referralsCount: 3, userId: '4' },
      { position: 5, anonymousAlias: 'VoidWalker', avatarEmoji: '🎭', referralsCount: 2, userId: '5' },
      { position: 6, anonymousAlias: 'CrypticRaven', avatarEmoji: '🦅', referralsCount: 1, userId: '6' },
      { position: 7, anonymousAlias: 'EnigmaSpecter', avatarEmoji: '🔮', referralsCount: 1, userId: '7' },
      { position: 8, anonymousAlias: 'SilentFox', avatarEmoji: '🦊', referralsCount: 1, userId: '8' },
      { position: 9, anonymousAlias: 'VeiledSerpent', avatarEmoji: '🐍', referralsCount: 0, userId: '9' },
      { position: 10, anonymousAlias: 'MoonShadow', avatarEmoji: '🌙', referralsCount: 0, userId: '10' }
    ];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// Get referral statistics
export const getReferralStats = async (): Promise<ReferralStats> => {
  try {
    // Get user data to match with referral info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get referral counts from localStorage
    const storedReferrals = localStorage.getItem('referralCounts') || '{}';
    const referralCounts = JSON.parse(storedReferrals);
    
    // Get this user's count or default to 0
    const userReferralsCount = user._id && referralCounts[user._id] ? 
      referralCounts[user._id] : 0;
    
    // Figure out which milestone is next
    const nextMilestone = userReferralsCount < 5 ? 5 : 
                         userReferralsCount < 10 ? 10 : 
                         userReferralsCount < 20 ? 20 : 25;
    
    // Calculate current tier
    const currentTier = userReferralsCount < 5 ? 0 : 
                       userReferralsCount < 10 ? 1 : 
                       userReferralsCount < 20 ? 2 : 3;
    
    // Return mock statistics data based on actual user referrals
    return {
      totalReferrals: userReferralsCount,
      pendingReferrals: Math.min(1, Math.floor(userReferralsCount/3)),
      completedReferrals: userReferralsCount - Math.min(1, Math.floor(userReferralsCount/3)),
      nextMilestone: nextMilestone,
      currentTier: currentTier
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    throw error;
  }
};

// Process a referral when someone signs up with a code
export const processReferral = (referralCode: string): boolean => {
  try {
    if (!referralCode) return false;
    
    // In a real implementation, this would verify the code server-side
    // For demo purposes, we'll simulate validating and processing the referral
    
    // Get all users (in a real app, this would be a server-side lookup)
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // Find the user with this referral code
    const referrer = allUsers.find((user: any) => {
      // Generate the same stable code for this user as in getUserReferralInfo
      const generateStableCode = (input: string) => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          const char = input.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36).substring(0, 6).toUpperCase().padEnd(6, '0');
      };
      
      const userCode = user._id ? 
        generateStableCode(user._id) : 
        (user.email ? generateStableCode(user.email) : '');
        
      return userCode === referralCode;
    });
    
    if (!referrer) return false;
    
    // Update referral count for this user
    const storedReferrals = localStorage.getItem('referralCounts') || '{}';
    const referralCounts = JSON.parse(storedReferrals);
    
    // Increment count
    if (referrer._id) {
      referralCounts[referrer._id] = (referralCounts[referrer._id] || 0) + 1;
      localStorage.setItem('referralCounts', JSON.stringify(referralCounts));
    }
    
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
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

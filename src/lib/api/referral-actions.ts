
import { api } from '@/lib/api';
import type { ReferralResponse, ClaimRewardResponse } from '../types/referral-api.types';

export const processReferral = async (referralCode: string): Promise<boolean> => {
  try {
    const userResponse = await api.get('/api/users/profile');
    const referredUserId = userResponse.data._id;

    const response = await api.post('/api/users/process-referral', { referralCode, referredUserId });
    return response.data.success;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
};

export const claimReward = async (tierId: number): Promise<ClaimRewardResponse> => {
  try {
    const response = await api.post('/api/users/claim-reward', { tierLevel: tierId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to claim reward');
  }
};

export const trackReferralShare = async (platform: string): Promise<void> => {
  try {
    console.log(`Shared referral code to ${platform}`);
  } catch (error) {
    console.error('Error tracking referral share:', error);
    throw error;
  }
};

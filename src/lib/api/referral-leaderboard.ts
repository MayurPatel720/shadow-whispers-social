
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '../types/referral-api.types';

export const getReferralLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await api.get('/api/users/referral-leaderboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

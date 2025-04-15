
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardUser {
  _id: string;
  anonymousAlias: string;
  avatarEmoji: string;
  referralCount: number;
}

interface ReferralLeaderboardProps {
  leaderboard: LeaderboardUser[];
  isLoading: boolean;
}

const ReferralLeaderboard: React.FC<ReferralLeaderboardProps> = ({ leaderboard, isLoading }) => {
  return (
    <Card className="border border-undercover-purple/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Trophy size={18} className="text-amber-400 mr-2" />
          Top Shadows Leaderboard
        </CardTitle>
        <CardDescription>The most active recruiters in Undercover</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center mb-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {leaderboard.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No recruiters yet.</p>
                <p className="text-sm">Be the first to climb the ranks!</p>
              </div>
            ) : (
              leaderboard.map((user, index) => (
                <div 
                  key={user._id} 
                  className={`flex items-center py-3 px-2 rounded-lg ${
                    index === 0 
                      ? 'bg-amber-400/10 border border-amber-400/30' 
                      : index === 1 
                        ? 'bg-slate-300/10 border border-slate-300/30' 
                        : index === 2 
                          ? 'bg-amber-700/10 border border-amber-700/30'
                          : ''
                  }`}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    {index === 0 ? (
                      <Trophy size={16} className="text-amber-400" />
                    ) : index === 1 ? (
                      <Medal size={16} className="text-slate-300" />
                    ) : index === 2 ? (
                      <Medal size={16} className="text-amber-700" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <div className="mr-2 text-xl">{user.avatarEmoji}</div>
                      <span className="font-medium">{user.anonymousAlias}</span>
                    </div>
                  </div>
                  <div className="font-medium">
                    <span className="text-undercover-light-purple">{user.referralCount}</span>
                    <span className="text-muted-foreground text-sm ml-1">invites</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard;

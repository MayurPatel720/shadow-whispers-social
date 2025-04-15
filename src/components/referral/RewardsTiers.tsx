
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardsTiersProps {
  referralCount: number;
  rewards: {
    type: 'badge' | 'cash' | 'premium';
    name: string;
    claimed: boolean;
  }[];
}

const RewardsTiers: React.FC<RewardsTiersProps> = ({ referralCount, rewards }) => {
  const tiers = [
    { level: 5, name: "Shadow Recruiter Badge", icon: <Award size={20} /> },
    { level: 10, name: "$100 Cash Reward", icon: <DollarSign size={20} /> },
    { level: 20, name: "Premium Features", icon: <Star size={20} /> }
  ];

  // Find highest achieved tier
  const maxTier = tiers.reduce((max, tier) => {
    return referralCount >= tier.level ? tier.level : max;
  }, 0);

  // Calculate progress percentage to next tier
  const getProgressToNextTier = () => {
    if (referralCount >= 20) return 100;
    if (referralCount >= 10) return (referralCount - 10) * 10; // 0-100% between 10-20
    if (referralCount >= 5) return (referralCount - 5) * 20; // 0-100% between 5-10
    return referralCount * 20; // 0-100% between 0-5
  };

  // Find the next tier to achieve
  const getNextTierTarget = () => {
    if (referralCount < 5) return 5;
    if (referralCount < 10) return 10;
    if (referralCount < 20) return 20;
    return null;
  };

  const nextTier = getNextTierTarget();

  return (
    <Card className="border border-undercover-purple/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Rewards Program</CardTitle>
        <CardDescription>Invite friends and earn exclusive rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>You've invited <span className="font-bold text-undercover-light-purple">{referralCount}</span> users</span>
            {nextTier && <span>{referralCount}/{nextTier} to next tier</span>}
          </div>
          <Progress value={getProgressToNextTier()} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {tiers.map((tier) => {
            const isUnlocked = referralCount >= tier.level;
            const hasReward = rewards.some(r => 
              (r.type === 'badge' && tier.level === 5) || 
              (r.type === 'cash' && tier.level === 10) || 
              (r.type === 'premium' && tier.level === 20)
            );
            
            return (
              <div 
                key={tier.level}
                className={cn(
                  "flex items-center p-3 rounded-lg border",
                  isUnlocked 
                    ? "bg-undercover-purple/10 border-undercover-purple"
                    : "bg-muted/30 border-border"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  isUnlocked ? "bg-undercover-purple/20 text-undercover-light-purple" : "bg-muted text-muted-foreground"
                )}>
                  {tier.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">{tier.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isUnlocked 
                      ? hasReward 
                        ? "Unlocked!" 
                        : "Unlocked! Claim your reward." 
                      : `Unlock at ${tier.level} referrals`}
                  </p>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                  <span className="text-xs font-medium">{tier.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsTiers;

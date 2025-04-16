
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Check, Gift } from "lucide-react";
import { ReferralTier } from "@/types/referral";
import { Progress } from "@/components/ui/progress";
import ClaimRewardModal from "./ClaimRewardModal";

interface ReferralTierCardProps {
  tier: ReferralTier;
  currentReferrals: number;
}

const ReferralTierCard: React.FC<ReferralTierCardProps> = ({ tier, currentReferrals }) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const calculateProgress = () => {
    const progress = (currentReferrals / tier.requiredReferrals) * 100;
    return Math.min(progress, 100);
  };

  return (
    <>
      <Card className={`relative overflow-hidden ${tier.isUnlocked ? "border-purple-500" : ""}`}>
        {tier.isUnlocked && (
          <div className="absolute top-0 right-0">
            <Badge className="m-2 bg-green-500">Unlocked</Badge>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <span className="text-2xl mr-2">{tier.rewardIcon}</span>
              Tier {tier.level}
            </CardTitle>
            {tier.isUnlocked ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">{tier.rewardIcon}</div>
            <h3 className="font-bold">{tier.rewardDescription}</h3>
            <p className="text-sm text-muted-foreground">
              {tier.requiredReferrals} referrals required
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{currentReferrals}/{tier.requiredReferrals} Referrals</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className={tier.isUnlocked ? "bg-purple-200" : ""} />
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full" 
            disabled={!tier.isUnlocked}
            variant={tier.isUnlocked ? "default" : "outline"}
            onClick={() => setIsClaimModalOpen(true)}
          >
            <Gift className="mr-2 h-4 w-4" />
            {tier.isUnlocked ? "Claim Reward" : `Need ${tier.requiredReferrals - currentReferrals} more`}
          </Button>
        </CardFooter>
      </Card>

      <ClaimRewardModal 
        open={isClaimModalOpen} 
        onOpenChange={setIsClaimModalOpen} 
        tier={tier} 
      />
    </>
  );
};

export default ReferralTierCard;

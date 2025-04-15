
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferralInfo } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import ReferralLeaderboard from "@/components/referral/ReferralLeaderboard";
import RewardsTiers from "@/components/referral/RewardsTiers";
import ShareReferral from "@/components/referral/ShareReferral";
import ClaimRewardModal from "@/components/referral/ClaimRewardModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign } from "lucide-react";

const ReferralPage = () => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState({ index: -1, name: "" });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["referralInfo"],
    queryFn: getReferralInfo,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to load referral data",
          description: "Please try again later.",
        });
      },
    },
  });

  const handleClaimReward = (index: number, name: string) => {
    setSelectedReward({ index, name });
    setClaimModalOpen(true);
  };

  // Default values while loading
  const referralCode = data?.referralCode || "LOADING";
  const referralCount = data?.referralCount || 0;
  const referralRewards = data?.referralRewards || [];
  const leaderboard = data?.leaderboard || [];

  // Find unclaimed cash reward
  const unclaimedCashReward = referralRewards.findIndex(
    (reward) => reward.type === "cash" && !reward.claimed
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20 md:pb-4 space-y-6">
      <h1 className="text-2xl font-bold text-undercover-light-purple mb-6">
        Referral Program
      </h1>

      {/* Show claim reward button if eligible */}
      {unclaimedCashReward >= 0 && (
        <div className="bg-undercover-purple/20 border border-undercover-purple rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-undercover-light-purple">
              Congratulations! You've earned $100!
            </h3>
            <p className="text-sm">
              You've reached 10+ referrals and unlocked the cash reward.
            </p>
          </div>
          <Button
            onClick={() =>
              handleClaimReward(unclaimedCashReward, "$100 Cash Reward")
            }
            className="bg-undercover-purple hover:bg-undercover-deep-purple"
          >
            <DollarSign size={16} className="mr-1" />
            Claim $100
          </Button>
        </div>
      )}

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShareReferral referralCode={referralCode} />
            <RewardsTiers
              referralCount={referralCount}
              rewards={referralRewards}
            />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <ReferralLeaderboard leaderboard={leaderboard} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <ClaimRewardModal
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        rewardIndex={selectedReward.index}
        rewardName={selectedReward.name}
        onClaimSuccess={refetch}
      />
    </div>
  );
};

export default ReferralPage;

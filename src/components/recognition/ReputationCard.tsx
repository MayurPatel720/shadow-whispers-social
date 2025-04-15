
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeType = {
  name: string;
  unlockedAt: Date;
};

type ReputationCardProps = {
  score: number;
  badges: BadgeType[];
  recognizedCount: number;
  recognizedByCount: number;
  recognitionRate: number;
};

const ReputationCard: React.FC<ReputationCardProps> = ({
  score,
  badges,
  recognizedCount,
  recognizedByCount,
  recognitionRate,
}) => {
  // Function to determine reputation tier and color
  const getReputationTier = (score: number): { tier: string; color: string } => {
    if (score >= 90) return { tier: "Shadow Legend", color: "bg-gradient-to-r from-violet-500 to-fuchsia-500" };
    if (score >= 75) return { tier: "Shadow Elite", color: "bg-undercover-purple" };
    if (score >= 50) return { tier: "Shadow Master", color: "bg-purple-600" };
    if (score >= 25) return { tier: "Shadow Novice", color: "bg-purple-400" };
    return { tier: "Shadow Initiate", color: "bg-gray-400" };
  };

  const { tier, color } = getReputationTier(score);

  return (
    <Card className="border border-undercover-purple/30 overflow-hidden">
      <div className={`h-1 w-full ${color}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="mr-2 h-5 w-5 text-undercover-light-purple" />
          Shadow Reputation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{tier}</p>
              <p className="font-bold text-lg">{score}/100</p>
            </div>
            <Progress 
              value={score} 
              className="h-2 bg-muted" 
              indicatorClassName={cn("transition-all duration-500", color)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Recognized</p>
              <p className="font-bold text-lg">{recognizedCount}</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Recognized By</p>
              <p className="font-bold text-lg">{recognizedByCount}</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Recognition Rate</p>
              <p className="font-bold text-lg">{recognitionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Badges Earned</p>
              <p className="font-bold text-lg">{badges.length}</p>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Earned Badges</p>
              <div className="flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-undercover-light-purple/10 text-undercover-light-purple border-undercover-light-purple/30"
                  >
                    <Award size={12} className="mr-1" />
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReputationCard;

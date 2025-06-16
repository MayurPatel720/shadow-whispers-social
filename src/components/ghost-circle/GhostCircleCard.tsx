
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ghost, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import InviteToCircleModal from "./InviteToCircleModal";
import AvatarGenerator from "@/components/user/AvatarGenerator";

interface GhostCircleCardProps {
  circle: {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    members: {
      userId: string;
      displayName?: string;
      anonymousAlias?: string;
      realUsername?: string | null;
      joinedAt?: string;
      avatarEmoji?: string;
    }[];
  };
  onSelect: (id: string, tab?: string) => void;
}

const GhostCircleCard: React.FC<GhostCircleCardProps> = ({ circle, onSelect }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  return (
    <Card className="rounded-3xl overflow-hidden glassmorphism text-card-foreground transition-transform duration-300 hover:scale-105 hover:shadow-2xl border-0 ring-1 ring-purple-900/40 backdrop-blur-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600/30 via-purple-700/40 to-fuchsia-800/20 pb-3 border-b-0 flex flex-col gap-2 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Ghost className="h-7 w-7 text-purple-400 drop-shadow" />
          <h3 className="font-extrabold text-xl text-white tracking-wide">{circle.name}</h3>
        </div>
        <p className="text-purple-200 text-base min-h-[2.5rem] italic line-clamp-2">{circle.description || "No description provided."}</p>
      </CardHeader>

      <CardContent className="pt-2 pb-3">
        <div className="flex items-center gap-3 text-sm text-purple-200">
          <Users size={16} className="text-purple-300" />
          <span>{circle.members.length} members</span>
          <div className="flex -space-x-2 ml-3">
            {circle.members.slice(0, 3).map((member) => (
              <div key={member.userId}>
                <AvatarGenerator
                  emoji={member.avatarEmoji ?? "👻"}
                  nickname={member.anonymousAlias ?? "Anonymous"}
                  size="xs"
                />
              </div>
            ))}
            {circle.members.length > 3 && (
              <span className="ml-2 text-xs font-bold text-purple-300">+{circle.members.length - 3}</span>
            )}
          </div>
          <Button
            variant="link"
            size="sm"
            className="ml-auto text-xs !text-purple-300 hover:underline"
            onClick={() => onSelect(circle._id, "members")}
            tabIndex={0}
          >
            View Members
          </Button>
        </div>
        <div className="text-xs text-purple-300 mt-2">
          Created {formatDistanceToNow(new Date(circle.createdAt))} ago
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-gradient-to-r from-purple-700/30 via-background/60 to-purple-950/20 pt-4 pb-5 px-5 rounded-b-3xl border-t-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="border-purple-500/30 text-purple-200 hover:text-white hover:border-purple-400 bg-purple-900/10"
        >
          Invite Friend
        </Button>

        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-1 rounded-full shadow-md glow-effect px-5 py-2"
          onClick={() => onSelect(circle._id)}
        >
          View Circle
          <ArrowRight size={15} />
        </Button>
      </CardFooter>

      <InviteToCircleModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        circleId={circle._id}
        circleName={circle.name}
      />
    </Card>
  );
};

export default GhostCircleCard;

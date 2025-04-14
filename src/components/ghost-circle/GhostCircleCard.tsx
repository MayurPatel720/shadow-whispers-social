
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ghost, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import InviteToCircleModal from "./InviteToCircleModal";

interface GhostCircleCardProps {
  circle: {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    members: { userId: string; joinedAt: string }[];
  };
  onSelect: (id: string) => void;
}

const GhostCircleCard: React.FC<GhostCircleCardProps> = ({ circle, onSelect }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  return (
    <Card className="overflow-hidden border-gray-200 hover:border-purple-300 transition-all">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-gray-50 pb-2">
        <div className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium text-lg">{circle.name}</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-600 text-sm mb-4">
          {circle.description || "No description provided."}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={14} />
          <span>{circle.members.length} members</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Created {formatDistanceToNow(new Date(circle.createdAt))} ago
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 pt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsInviteModalOpen(true)}
          className="text-xs"
        >
          Invite Friend
        </Button>
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 text-xs flex items-center gap-1"
          onClick={() => onSelect(circle._id)}
        >
          View Circle
          <ArrowRight size={14} />
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

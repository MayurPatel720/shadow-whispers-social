
import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserRound,
  MessageCircle,
  RotateCcw,
  Shield,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { leaveCompliment, revokeRecognition, challengeUser } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import ComplimentDialog from "./ComplimentDialog";

type RecognizedUser = {
  _id: string;
  username: string;
  anonymousAlias: string;
  avatarEmoji: string;
  recognizedAt: Date;
  compliments: Array<{
    text: string;
    createdAt: Date;
  }>;
  lastRevokedAt?: Date;
  canRecognizeAgainAt?: Date;
  isChallengeable?: boolean;
};

type RecognitionTabsProps = {
  recognizedUsers: RecognizedUser[];
  recognizedByUsers: RecognizedUser[];
  isLoading: boolean;
  onRecognitionUpdate: () => void;
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
};

const RecognitionTabs: React.FC<RecognitionTabsProps> = ({
  recognizedUsers,
  recognizedByUsers,
  isLoading,
  onRecognitionUpdate,
  filter,
  setFilter,
}) => {
  const [complimentDialogOpen, setComplimentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RecognizedUser | null>(null);

  const handleOpenComplimentDialog = (user: RecognizedUser) => {
    setSelectedUser(user);
    setComplimentDialogOpen(true);
  };

  const handleComplimentSubmit = async (complimentText: string) => {
    if (!selectedUser) return;

    try {
      await leaveCompliment(selectedUser._id, complimentText);
      toast({
        title: "Compliment sent",
        description: `Your compliment was sent to ${selectedUser.anonymousAlias}`,
      });
      onRecognitionUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send compliment",
        description: "Please try again later",
      });
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await revokeRecognition(userId);
      toast({
        title: "Recognition revoked",
        description: "You can recognize this user again after 30 days",
      });
      onRecognitionUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to revoke recognition",
        description: error?.message || "Please try again later",
      });
    }
  };

  const handleChallenge = async (userId: string) => {
    try {
      await challengeUser(userId);
      toast({
        title: "Challenge initiated",
        description: "The user will need to recognize you again",
      });
      onRecognitionUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to initiate challenge",
        description: error?.message || "Please try again later",
      });
    }
  };

  const filterUsers = (users: RecognizedUser[]) => {
    switch (filter) {
      case "recent":
        return [...users].sort(
          (a, b) =>
            new Date(b.recognizedAt).getTime() -
            new Date(a.recognizedAt).getTime()
        );
      case "mutual":
        return users.filter((user) => {
          if (
            (recognizedUsers && recognizedByUsers) &&
            recognizedUsers.some(ru => ru._id === user._id) && 
            recognizedByUsers.some(rbu => rbu._id === user._id)
          ) {
            return true;
          }
          return false;
        });
      default:
        return users;
    }
  };

  const renderUserList = (
    users: RecognizedUser[],
    isRecognizedTab: boolean
  ) => {
    const filteredUsers = filterUsers(users);

    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 mb-2 border rounded-lg bg-card"
          >
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="ml-3 w-full">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ));
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-10 border border-dashed rounded-lg bg-card/50">
          <p className="text-muted-foreground">
            {filter === "mutual"
              ? "No mutual recognitions found"
              : isRecognizedTab
              ? "You haven't recognized anyone yet"
              : "No one has recognized you yet"}
          </p>
        </div>
      );
    }

    return filteredUsers.map((user) => (
      <div
        key={user._id}
        className="flex items-center justify-between p-4 mb-2 border rounded-lg bg-card hover:border-undercover-light-purple/40 transition-colors"
      >
        <div className="flex items-center">
          <Avatar className="bg-undercover-dark h-12 w-12">
            <AvatarFallback>{user.avatarEmoji}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium">{user.anonymousAlias}</h3>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
            {user.compliments && user.compliments.length > 0 && (
              <Badge
                variant="outline"
                className="mt-1 bg-undercover-light-purple/10 text-undercover-light-purple border-undercover-light-purple/30"
              >
                <Star size={12} className="mr-1" />
                {user.compliments.length} Compliment
                {user.compliments.length !== 1 && "s"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {isRecognizedTab ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleOpenComplimentDialog(user)}
              >
                <MessageCircle size={14} className="mr-1" />
                Compliment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive/90"
                onClick={() => handleRevoke(user._id)}
              >
                <RotateCcw size={14} className="mr-1" />
                Revoke
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => handleChallenge(user._id)}
              disabled={!user.isChallengeable}
            >
              <RefreshCw size={14} className="mr-1" />
              Challenge
            </Button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <>
      <Tabs defaultValue="recognized" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
            <TabsTrigger value="recognized" className="flex items-center">
              <Users size={16} className="mr-2" />
              Recognized
            </TabsTrigger>
            <TabsTrigger value="recognizedBy" className="flex items-center">
              <UserRound size={16} className="mr-2" />
              Recognized By
            </TabsTrigger>
          </TabsList>

          <div className="flex">
            <Button
              variant={filter === "recent" ? "secondary" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setFilter("recent")}
            >
              Recent
            </Button>
            <Button
              variant={filter === "mutual" ? "secondary" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setFilter("mutual")}
            >
              Mutual
            </Button>
          </div>
        </div>

        <TabsContent value="recognized" className="mt-0">
          {renderUserList(recognizedUsers, true)}
        </TabsContent>

        <TabsContent value="recognizedBy" className="mt-0">
          {renderUserList(recognizedByUsers, false)}
        </TabsContent>
      </Tabs>

      <ComplimentDialog
        open={complimentDialogOpen}
        onOpenChange={setComplimentDialogOpen}
        targetUser={selectedUser}
        onSubmit={handleComplimentSubmit}
      />
    </>
  );
};

export default RecognitionTabs;

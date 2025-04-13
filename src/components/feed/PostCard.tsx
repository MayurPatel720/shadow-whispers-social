
import React, { useState } from "react";
import { Heart, MessageCircle, Info, Sparkles } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AvatarGenerator from "../user/AvatarGenerator";
import { useAuth } from "@/context/AuthContext";
import { likePost } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface PostCardProps {
  post: any; // Will refine the type when we have the full PostModel
  currentUserId?: string;
  onRefresh?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onRefresh }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.user === currentUserId)
  );
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const response = await likePost(post._id);
      
      setLikeCount(response.likes);
      setIsLiked(!isLiked);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not like this post. Please try again."
      });
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Format the post time
  const postTime = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "Unknown time";

  // Create a simple identity object from post data
  const identity = {
    emoji: post.avatarEmoji || "🎭",
    nickname: post.anonymousAlias || "Anonymous",
    color: "#9333EA", // Default purple color
  };

  return (
    <Card className="border border-undercover-purple/20 bg-card shadow-md hover:shadow-lg transition-shadow mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <AvatarGenerator 
            emoji={identity.emoji} 
            nickname={identity.nickname} 
            color={identity.color}
          />
          
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">{postTime}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-foreground">{post.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 text-xs"
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart 
              size={16} 
              className={isLiked ? "fill-red-500 text-red-500" : ""}
            />
            <span>{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 text-xs"
          >
            <MessageCircle size={16} />
            <span>{post.comments?.length || 0}</span>
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Info size={14} className="mr-1" />
                <span>Guess who?</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Try to guess who this user is</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default PostCard;

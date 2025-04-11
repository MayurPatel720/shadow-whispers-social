
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

interface PostCardProps {
  post: {
    id: string;
    content: string;
    time: string;
    likes: number;
    comments: number;
    identity: {
      emoji: string;
      nickname: string;
      color: string;
    };
    clueCount: number;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <Card className="border border-undercover-purple/20 bg-card shadow-md hover:shadow-lg transition-shadow mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <AvatarGenerator 
            emoji={post.identity.emoji} 
            nickname={post.identity.nickname} 
            color={post.identity.color}
          />
          
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">{post.time}</span>
            {post.clueCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-undercover-purple ml-1">
                      <Sparkles size={14} />
                      <span className="text-xs">{post.clueCount}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">You have {post.clueCount} clues about this user</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
          >
            <Heart 
              size={16} 
              className={liked ? "fill-red-500 text-red-500" : ""}
            />
            <span>{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 text-xs"
          >
            <MessageCircle size={16} />
            <span>{post.comments}</span>
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

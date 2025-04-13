
import React, { useState } from "react";
import { Heart, MessageCircle, Info, Sparkles, MoreVertical, Trash, Edit } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarGenerator from "../user/AvatarGenerator";
import { useAuth } from "@/context/AuthContext";
import { likePost } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import EditPostModal from "./EditPostModal";
import DeletePostDialog from "./DeletePostDialog";

interface PostCardProps {
  post: any; // Will refine the type when we have the full PostModel
  currentUserId?: string;
  onRefresh?: () => void;
  showOptions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onRefresh, showOptions = false }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.user === currentUserId)
  );
  const [isLiking, setIsLiking] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Check if the post belongs to the current user
  const isOwnPost = post.user === currentUserId;

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
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{postTime}</span>
            
            {(showOptions && isOwnPost) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash size={16} className="mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-foreground mb-2">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post image" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
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
      
      {isOwnPost && (
        <>
          <EditPostModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            post={post}
            onSuccess={() => {
              if (onRefresh) onRefresh();
            }}
          />
          
          <DeletePostDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            postId={post._id}
            onSuccess={() => {
              if (onRefresh) onRefresh();
            }}
          />
        </>
      )}
    </Card>
  );
};

export default PostCard;

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Heart, MessageCircle, Info, MoreVertical, Trash, Edit, Send } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { likePost, addComment, getComments, deletePost } from "@/lib/api";
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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleToggleComments = async () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const loadComments = async () => {
    if (isLoadingComments) return;
  
    try {
      setIsLoadingComments(true);
      const fetchedComments = await getComments(post._id);
      console.log('Fetching comments for post with ID:', post._id);

      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load comments. Please try again.",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
  
    try {
      setIsSubmitting(true);
      await addComment(post._id, newComment.trim(),user.anonymousAlias);
  
      setNewComment("");
      loadComments(); // Reload comments after adding a new one
  
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully!",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not post your comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
  
  // Process image URL to ensure it's valid
  const imageUrl = post.imageUrl ? (
    post.imageUrl.startsWith('http') ? post.imageUrl : `${import.meta.env.VITE_API_URL || 'https://undercover-service.onrender.com'}${post.imageUrl}`
  ) : null;
  
  return (
    <Card className="border border-undercover-purple/20 bg-card shadow-md hover:shadow-lg transition-shadow mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <AvatarGenerator 
              emoji={identity.emoji} 
              nickname={identity.nickname} 
              color={identity.color}
            />
            <span className="font-medium text-sm">{identity.nickname}</span>
          </div>
          
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
        
        {imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Post image" 
              className="w-full h-auto max-h-80 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error("Image failed to load:", target.src);
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex justify-between w-full">
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
              onClick={handleToggleComments}
            >
              <MessageCircle size={16} />
              <span>{comments.length || post.comments?.length || 0}</span>
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
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <div className="border-t border-border pt-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-undercover-purple rounded-full border-t-transparent"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-2">
                      <AvatarGenerator
                        emoji={comment.avatarEmoji || "🎭"}
                        nickname={comment.anonymousAlias || "Anonymous"}
                        size="xs"
                        color="#9333EA"
                      />
                      <div className="bg-muted p-2 rounded-md text-sm flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-xs">{comment.anonymousAlias || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-2">No comments yet</p>
              )}

              <div className="mt-4 flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="resize-none h-10 py-2"
                />
                <Button 
                  onClick={handleSubmitComment} 
                  className="bg-undercover-purple hover:bg-undercover-deep-purple"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
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

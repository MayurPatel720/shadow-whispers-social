
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ghost, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal"; 
import { getGhostCirclePosts, getGhostCircleById } from "@/lib/api";
import { PostType, GhostCircleType } from "@/types";

interface CircleFeedViewProps {
  circleId: string;
  onBack?: () => void;
}

const CircleFeedView: React.FC<CircleFeedViewProps> = ({ circleId, onBack }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  const { data: circleDetails, isLoading: isLoadingCircle } = useQuery({
    queryKey: ["circleDetails", circleId],
    queryFn: () => getGhostCircleById(circleId),
  });
  
  const { 
    data: posts = [], 
    isLoading: isLoadingPosts, 
    refetch 
  } = useQuery({
    queryKey: ["circlePosts", circleId],
    queryFn: () => getGhostCirclePosts(circleId),
  });

  const handlePostSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  const isLoading = isLoadingCircle || isLoadingPosts;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft />
            </Button>
          )}
          <h2 className="text-xl font-medium flex items-center gap-2">
            <Ghost className="h-5 w-5 text-purple-500" />
            {circleDetails?.name || "Circle Feed"}
          </h2>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create Post
          </Button>
        </div>
        
        {circleDetails && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{circleDetails.members?.length || 0} members</span>
            </div>
            <div className="flex gap-4">
              <Button 
                variant={activeTab === 'posts' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </Button>
              <Button 
                variant={activeTab === 'about' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab('about')}
              >
                About
              </Button>
              <Button 
                variant={activeTab === 'members' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab('members')}
              >
                Members
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                <Ghost className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-4">Be the first to share something in this circle!</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} onRefresh={refetch} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'about' && circleDetails && (
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">About this Circle</h3>
            <p className="text-muted-foreground mb-4">
              {circleDetails.description || "No description provided."}
            </p>
            <div className="text-sm text-muted-foreground">
              Created {new Date(circleDetails.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
        
        {activeTab === 'members' && circleDetails && (
          <div className="bg-card rounded-lg border">
            <h3 className="p-4 border-b font-medium">Members ({circleDetails.members?.length || 0})</h3>
            <div className="divide-y">
              {circleDetails.members?.map((member) => (
                <div key={member._id} className="p-4 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-undercover-dark flex items-center justify-center mr-3">
                    {member.avatarEmoji || "🎭"}
                  </div>
                  <div>
                    <div className="font-medium">{member.anonymousAlias}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handlePostSuccess}
        ghostCircleId={circleId}
      />
    </div>
  );
};

export default CircleFeedView;

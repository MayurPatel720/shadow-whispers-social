
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Ghost, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal"; 
import { getGhostCirclePosts } from "@/lib/api";

interface CircleFeedViewProps {
  circleId: string;
}

const CircleFeedView: React.FC<CircleFeedViewProps> = ({ circleId }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["circlePosts", circleId],
    queryFn: () => getGhostCirclePosts(circleId),
  });

  const handlePostSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium flex items-center gap-2">
          <Ghost className="h-5 w-5 text-purple-500" />
          Circle Feed
        </h2>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
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

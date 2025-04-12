
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGlobalFeed } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/feed/PostCard";
import { Loader } from "lucide-react";

const GlobalFeed = () => {
  const { user } = useAuth();
  
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['globalFeed'],
    queryFn: getGlobalFeed,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center">
        <p className="text-red-400">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h2 className="mb-6 text-center text-2xl font-bold text-purple-300">Global Feed</h2>
      
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard 
              key={post._id} 
              post={post} 
              currentUserId={user?._id}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No posts found. Be the first to post something!</p>
      )}
    </div>
  );
};

export default GlobalFeed;

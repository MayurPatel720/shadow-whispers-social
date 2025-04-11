
import React, { useState } from "react";
import { PenSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";
import { generateMockPosts } from "@/lib/utils/generators";

const GlobalFeed: React.FC = () => {
  const [posts, setPosts] = useState(generateMockPosts(15));

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-border">
        <h1 className="text-xl font-bold text-undercover-light-purple">
          Global Feed
        </h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-undercover-purple/30 text-undercover-light-purple"
          >
            <Filter size={16} className="mr-1" />
            <span className="text-xs">Filter</span>
          </Button>
          <Button className="bg-undercover-purple text-white hover:bg-undercover-deep-purple">
            <PenSquare size={16} className="mr-1" />
            <span className="text-xs">New Post</span>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default GlobalFeed;

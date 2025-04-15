
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ghost, Plus, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyGhostCircles } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import CreateGhostCircleModal from "@/components/ghost-circle/CreateGhostCircleModal";
import GhostCircleCard from "@/components/ghost-circle/GhostCircleCard";
import CircleFeedView from "@/components/ghost-circle/CircleFeedView";
import { GhostCircleType } from "@/types";

const GhostCircles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  
  const { data: ghostCircles = [], isLoading, refetch } = useQuery({
    queryKey: ["ghostCircles"],
    queryFn: getMyGhostCircles,
  });

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleCircleSelect = (circleId: string) => {
    setSelectedCircleId(circleId);
  };

  const handleBackToCircles = () => {
    setSelectedCircleId(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If a circle is selected, show its feed view
  if (selectedCircleId) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground mr-4"
            onClick={handleBackToCircles}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Circles
          </Button>
        </div>
        <CircleFeedView circleId={selectedCircleId} onBack={handleBackToCircles} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ghost className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Ghost Circles</h1>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Circle
          </Button>
        </div>

        {ghostCircles.length === 0 ? (
          <Card className="bg-gray-50 border border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Ghost className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Ghost Circles Yet</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                Create your first anonymous circle to connect with friends in a private, secret space.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Circle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ghostCircles.map((circle: GhostCircleType) => (
              <GhostCircleCard 
                key={circle._id} 
                circle={circle} 
                onSelect={handleCircleSelect} 
              />
            ))}
          </div>
        )}
      </div>

      <CreateGhostCircleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default GhostCircles;

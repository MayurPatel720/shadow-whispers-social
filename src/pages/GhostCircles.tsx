
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { getMyGhostCircles } from "@/lib/api";
import CreateGhostCircleModal from "@/components/ghost-circle/CreateGhostCircleModal";
import GhostCircleCard from "@/components/ghost-circle/GhostCircleCard";
import CircleFeedView from "@/components/ghost-circle/CircleFeedView";
import { GhostCircleType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const GhostCircles = () => {
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    data: circles = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["myGhostCircles"],
    queryFn: getMyGhostCircles,
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleSelectCircle = (circleId: string) => {
    setActiveCircleId(circleId);
  };

  const handleBack = () => {
    setActiveCircleId(null);
  };

  // Show single circle view if a circle is selected
  if (activeCircleId) {
    return <CircleFeedView circleId={activeCircleId} onBack={handleBack} />;
  }

  // Normalize circles to ensure it's an array
  const circlesList = Array.isArray(circles) ? circles : [];
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ghost Circles</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} className="mr-1" />
          New Circle
        </Button>
      </div>

      <Tabs defaultValue="my-circles" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="my-circles">My Circles</TabsTrigger>
          <TabsTrigger value="joined-circles">Joined Circles</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-circles">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-36 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : circlesList.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Ghost Circles yet</h3>
              <p className="text-muted-foreground mb-4">Create your first anonymous circle</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Ghost Circle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {circlesList.map((circle: GhostCircleType) => (
                <GhostCircleCard
                  key={circle._id}
                  circle={circle}
                  onSelect={handleSelectCircle}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined-circles">
          <div className="text-center py-12 opacity-60">
            <p>Coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="discover">
          <div className="text-center py-12 opacity-60">
            <p>Discover new circles coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      <CreateGhostCircleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default GhostCircles;

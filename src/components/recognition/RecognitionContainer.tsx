
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecognitionStats } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import RecognitionTabs from "./RecognitionTabs";
import ReputationCard from "./ReputationCard";
import ComplimentsWall from "./ComplimentsWall";

const RecognitionContainer: React.FC = () => {
  const [filter, setFilter] = useState<string>("recent");

  const {
    data: statsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["recognitionStats"],
    queryFn: getRecognitionStats,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to load recognition data",
          description: "Please try again later",
        });
      },
    },
  });

  // Extract all compliments from identityRecognizers
  const extractCompliments = () => {
    if (!statsData) return [];

    const allCompliments = [];
    for (const recognizer of statsData.recognizedUsers || []) {
      if (recognizer.compliments && recognizer.compliments.length > 0) {
        allCompliments.push(...recognizer.compliments);
      }
    }
    
    // Sort by date, newest first
    return allCompliments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const allCompliments = statsData ? extractCompliments() : [];

  return (
    <div className="space-y-6">
      {/* Stats and Compliments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReputationCard
          score={statsData?.stats?.shadowReputation?.score || 0}
          badges={statsData?.stats?.shadowReputation?.badges || []}
          recognizedCount={statsData?.stats?.recognizedCount || 0}
          recognizedByCount={statsData?.stats?.recognizedByCount || 0}
          recognitionRate={statsData?.stats?.recognitionRate || 0}
        />
        <ComplimentsWall compliments={allCompliments} isLoading={isLoading} />
      </div>

      {/* Recognition Tabs */}
      <div>
        <RecognitionTabs
          recognizedUsers={statsData?.recognizedUsers || []}
          recognizedByUsers={statsData?.identityRecognizers || []}
          isLoading={isLoading}
          onRecognitionUpdate={refetch}
          filter={filter}
          setFilter={setFilter}
        />
      </div>
    </div>
  );
};

export default RecognitionContainer;

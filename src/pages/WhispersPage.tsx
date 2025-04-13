
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyWhispers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import WhisperConversation from "@/components/whisper/WhisperConversation";
import { toast } from "@/hooks/use-toast";

const WhispersPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['whispers'],
    queryFn: getMyWhispers,
    enabled: !!user
  });

  // Handle error separately
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching whispers:", error);
      toast({
        variant: "destructive",
        title: "Error loading whispers",
        description: "Could not load your whispers. Please try again later."
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center py-10">
          <Loader className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`md:w-1/3 border-r border-border ${selectedConversation ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-undercover-light-purple">Whispers</h2>
              <p className="text-sm text-muted-foreground">Anonymous messages</p>
            </div>
            
            {conversations && conversations.length > 0 ? (
              <div className="divide-y divide-border">
                {conversations.map((convo) => (
                  <div 
                    key={convo._id}
                    className="p-3 hover:bg-undercover-purple/5 cursor-pointer"
                    onClick={() => setSelectedConversation(convo)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-undercover-dark">
                        {convo.partner.avatarEmoji || "🎭"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {convo.partner.anonymousAlias || "Anonymous"}
                          </span>
                          {convo.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-undercover-purple text-white text-xs">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {convo.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">No whispers yet.</p>
                <Button className="mt-4 bg-undercover-purple" onClick={() => {}}>
                  Start a whisper
                </Button>
              </div>
            )}
          </div>
          
          {/* Conversation View */}
          <div className={`flex-1 ${!selectedConversation ? 'hidden md:block' : ''}`}>
            {selectedConversation ? (
              <WhisperConversation 
                partnerId={selectedConversation._id} 
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-undercover-light-purple mb-2">
                  Your Whispers
                </h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Select a conversation to view your whispers. 
                  All messages are anonymous until someone correctly guesses your identity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default WhispersPage;


import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWhisperConversation, sendWhisper } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WhisperConversationProps {
  partnerId: string;
  onBack: () => void;
}

const WhisperConversation: React.FC<WhisperConversationProps> = ({ partnerId, onBack }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  const { data: conversation, isLoading, error, refetch } = useQuery({
    queryKey: ['whisperConversation', partnerId],
    queryFn: () => getWhisperConversation(partnerId),
    enabled: !!partnerId && !!user
  });

  const sendWhisperMutation = useMutation({
    mutationFn: (content: string) => sendWhisper(partnerId, content),
    onSuccess: () => {
      setMessage("");
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again later."
      });
    }
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendWhisperMutation.mutate(message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-destructive mb-2">Failed to load conversation</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!conversation) return null;

  const { partner, messages, hasRecognized } = conversation;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-undercover-dark">
            {partner.avatarEmoji || "🎭"}
          </div>
          <div>
            <h3 className="font-medium">
              {partner.anonymousAlias}
              {hasRecognized && partner.username && (
                <span className="ml-2 text-xs text-muted-foreground">
                  @{partner.username}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasRecognized ? "Identity revealed" : "Anonymous whispers"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === user._id;
          return (
            <div 
              key={msg._id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] 
                rounded-lg 
                p-3 
                ${isMe ? 
                  'bg-undercover-purple text-white rounded-br-none' : 
                  'bg-undercover-dark rounded-bl-none'
                }
              `}>
                <p>{msg.content}</p>
                <div className={`
                  text-xs mt-1 
                  ${isMe ? 'text-white/70 text-right' : 'text-muted-foreground'}
                `}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 mr-2 bg-background border-undercover-purple/30"
          />
          <Button 
            type="submit"
            size="icon"
            disabled={!message.trim() || sendWhisperMutation.isPending}
            className="bg-undercover-purple hover:bg-undercover-deep-purple"
          >
            {sendWhisperMutation.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WhisperConversation;


import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWhisperConversation, sendWhisper } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AvatarGenerator from "@/components/user/AvatarGenerator";

interface WhisperConversationProps {
  partnerId: string;
  onBack: () => void;
}

const WhisperConversation: React.FC<WhisperConversationProps> = ({ partnerId, onBack }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  
  const { data: conversation, isLoading, error, refetch } = useQuery({
    queryKey: ['whisperConversation', partnerId],
    queryFn: () => getWhisperConversation(partnerId),
    enabled: !!partnerId && !!user,
    refetchInterval: 10000, // Refresh every 10 seconds to check for new messages
  });

  const sendWhisperMutation = useMutation({
    mutationFn: (content: string) => sendWhisper(partnerId, content),
    onSuccess: () => {
      setMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ['whispers'] });
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    messages.forEach(message => {
      const messageDate = formatDate(message.createdAt);
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }
    
    return groups;
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
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center sticky top-0 bg-background z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="flex items-center space-x-3">
          <AvatarGenerator
            emoji={partner.avatarEmoji || "🎭"} 
            nickname={partner.anonymousAlias}
            color="#6E59A5"
            size="md"
          />
          <div>
            <h3 className="font-medium flex items-center">
              {partner.anonymousAlias}
              {hasRecognized && partner.username && (
                <span className="ml-2 text-xs bg-undercover-purple/20 text-undercover-light-purple px-2 py-1 rounded-full flex items-center">
                  <User size={12} className="mr-1" />
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
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p>Start a conversation by sending a message.</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                  {group.date}
                </span>
              </div>
              
              {group.messages.map((msg) => {
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
                      <p className="break-words">{msg.content}</p>
                      <div className={`
                        text-xs mt-1 flex items-center justify-end
                        ${isMe ? 'text-white/70' : 'text-muted-foreground'}
                      `}>
                        {formatTime(msg.createdAt)}
                        {isMe && msg.read && (
                          <span className="ml-1">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-border p-3 sticky bottom-0 bg-background">
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

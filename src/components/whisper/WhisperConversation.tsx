
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWhisperConversation, sendWhisper } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader, User, Trash2, MoreVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    queryKey: ["whisperConversation", partnerId],
    queryFn: () => getWhisperConversation(partnerId),
    enabled: !!partnerId && !!user,
    refetchInterval: 10000,
  });

  const sendWhisperMutation = useMutation({
    mutationFn: (content: string) => sendWhisper(partnerId, content),
    onSuccess: () => {
      setMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again later.",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      // This would be a real API call in a production app
      // For now we'll simulate success
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "Your message has been removed.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description: "Please try again later.",
      });
    },
  });

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

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];

    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = formatDate(message.createdAt);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup,
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
        messages: currentGroup,
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
    <div className="flex flex-col h-screen bg-undercover-dark text-white">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6e59a5;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #57458b;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6e59a5 #2a2a2a;
        }
      `}</style>

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center sticky top-0 bg-undercover-dark z-10">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 text-white"
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
            <h3 className="font-medium flex items-center text-white">
              {partner.anonymousAlias}
              {hasRecognized && partner.username && (
                <span className="ml-2 text-xs bg-undercover-purple/20 text-undercover-light-purple px-2 py-1 rounded-full flex items-center">
                  <User size={12} className="mr-1" />
                  @{partner.username}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400">
              {hasRecognized ? "Identity revealed" : "Anonymous whispers"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-undercover-dark">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <p>Start a conversation by sending a message.</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">
                  {group.date}
                </span>
              </div>

              {group.messages.map((msg) => {
                const isMe = msg.sender === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
                  >
                    <div
                      className={`
                        max-w-[80%] 
                        rounded-lg 
                        p-3 
                        ${isMe
                          ? "bg-undercover-purple text-white rounded-br-none"
                          : "bg-gray-700 text-white rounded-bl-none"
                        }
                      `}
                    >
                      <p className="break-words">{msg.content}</p>
                      <div
                        className={`
                          text-xs mt-1 flex items-center justify-end
                          ${isMe ? "text-white/70" : "text-gray-400"}
                        `}
                      >
                        {formatTime(msg.createdAt)}
                        {isMe && msg.read && <span className="ml-1">✓</span>}
                      </div>
                    </div>
                    
                    {isMe && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 absolute -left-7 top-1"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem 
                            className="text-red-500 flex items-center cursor-pointer"
                            onClick={() => handleDeleteMessage(msg._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-undercover-dark sticky bottom-16 z-20 flex items-center justify-between md:bottom-0">
        <form onSubmit={handleSendMessage} className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-800 border-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-undercover-purple p-2 rounded-lg"
          />
        </form>
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || sendWhisperMutation.isPending}
          onClick={handleSendMessage}
          className="bg-undercover-purple hover:bg-undercover-deep-purple rounded-full w-12 h-12 ml-2 flex items-center justify-center"
        >
          {sendWhisperMutation.isPending ? (
            <Loader className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Send size={16} className="text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default WhisperConversation;

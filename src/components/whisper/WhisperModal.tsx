
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sendWhisper } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface WhisperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WhisperModal: React.FC<WhisperModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const maxWords = 20;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessage(text);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setSelectedUser(null);
    // In a full implementation, you would add a debounced search here
  };

  const sendWhisperMutation = useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string, content: string }) => 
      sendWhisper(receiverId, content),
    onSuccess: () => {
      toast({
        title: "Whisper sent",
        description: "Your anonymous whisper has been delivered."
      });
      setMessage("");
      setWordCount(0);
      setUsername("");
      setSelectedUser(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send whisper",
        description: error.message || "Please try again later."
      });
    }
  });

  const handleSendWhisper = () => {
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "No recipient selected",
        description: "Please select a user to whisper to."
      });
      return;
    }

    sendWhisperMutation.mutate({
      receiverId: selectedUser._id,
      content: message
    });
  };

  // In a full implementation, this would be a proper API call to search users
  const searchUser = () => {
    // Mock search result for demonstration
    if (username.trim()) {
      setSearchResults([
        { _id: "mock-user-1", username: username, anonymousAlias: "Mystery" + username }
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-undercover-purple/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-undercover-light-purple flex items-center justify-center">
            <MessageSquare className="inline-block mr-2" size={18} />
            Whisper Mode
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Send an anonymous message to someone.
            <br />
            <span className="text-undercover-light-purple">
              They won't know who you are unless they guess correctly.
            </span>
          </p>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center">
                <Input
                  placeholder="To: @username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="bg-background border-undercover-purple/30 pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0" 
                  onClick={searchUser}
                >
                  <Search size={16} />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-undercover-purple/30 rounded-md shadow-md">
                  {searchResults.map(user => (
                    <div 
                      key={user._id} 
                      className="p-2 hover:bg-undercover-purple/10 cursor-pointer"
                      onClick={() => selectUser(user)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{user.anonymousAlias}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Input
                placeholder="Your anonymous whisper..."
                value={message}
                onChange={handleInputChange}
                className="bg-background border-undercover-purple/30"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${wordCount > maxWords ? "text-destructive" : "text-muted-foreground"}`}>
                  {wordCount}/{maxWords} words
                </span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendWhisper}
            className="bg-undercover-purple hover:bg-undercover-deep-purple"
            disabled={wordCount === 0 || wordCount > maxWords || !selectedUser || sendWhisperMutation.isPending}
          >
            {sendWhisperMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Whisper"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhisperModal;

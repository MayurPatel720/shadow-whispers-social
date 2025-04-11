
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
import { MessageSquare } from "lucide-react";

interface WhisperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WhisperModal: React.FC<WhisperModalProps> = ({ open, onOpenChange }) => {
  const [message, setMessage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 20;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessage(text);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleSendWhisper = () => {
    // In a real app, this would send the whisper message
    console.log("Sending whisper:", message);
    setMessage("");
    setWordCount(0);
    onOpenChange(false);
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
            <div>
              <Input
                placeholder="To: @username"
                className="bg-background border-undercover-purple/30"
              />
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
            disabled={wordCount === 0 || wordCount > maxWords}
          >
            Send Whisper
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhisperModal;

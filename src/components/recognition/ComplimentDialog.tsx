
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

type ComplimentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    anonymousAlias: string;
    username: string;
    avatarEmoji: string;
  } | null;
  onSubmit: (compliment: string) => void;
};

const COMPLIMENT_TEMPLATES = [
  "Great guesser! Your detective skills are impressive.",
  "Master of mystery! You saw through my disguise.",
  "Shadow hunter extraordinaire! I'm impressed.",
  "You're too good at this! Can't hide from you.",
  "Identity uncovered! Well played, detective.",
  "Brilliant deduction! You're a natural.",
  "Sharp instincts! Nothing gets past you.",
  "Impressive recognition skills! Respect.",
];

const ComplimentDialog: React.FC<ComplimentDialogProps> = ({
  open,
  onOpenChange,
  targetUser,
  onSubmit,
}) => {
  const [selectedCompliment, setSelectedCompliment] = useState(COMPLIMENT_TEMPLATES[0]);

  const handleSubmit = () => {
    onSubmit(selectedCompliment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-undercover-light-purple" />
            Send a Compliment
          </DialogTitle>
        </DialogHeader>
        {targetUser && (
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">
                Sending compliment to:
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-undercover-dark flex items-center justify-center text-xl">
                  {targetUser.avatarEmoji}
                </div>
                <div>
                  <p className="font-medium">{targetUser.anonymousAlias}</p>
                  <p className="text-xs text-muted-foreground">
                    @{targetUser.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Choose a compliment:</p>
              <RadioGroup
                value={selectedCompliment}
                onValueChange={setSelectedCompliment}
                className="space-y-2"
              >
                {COMPLIMENT_TEMPLATES.map((compliment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={compliment} id={`compliment-${index}`} />
                    <Label
                      htmlFor={`compliment-${index}`}
                      className="text-sm cursor-pointer"
                    >
                      {compliment}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            className="bg-undercover-purple hover:bg-undercover-deep-purple"
            onClick={handleSubmit}
          >
            Send Compliment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplimentDialog;

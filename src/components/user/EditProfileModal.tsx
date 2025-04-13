
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for actual implementation
      // In a real app, we would call an API to update the profile
      setTimeout(() => {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        onOpenChange(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="anonymousAlias">Anonymous Alias</Label>
            <Input 
              id="anonymousAlias" 
              value={user?.anonymousAlias || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your anonymous alias cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emojiAvatar">Emoji Avatar</Label>
            <Input 
              id="emojiAvatar" 
              value={user?.avatarEmoji || "🎭"} 
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your emoji avatar cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us something about yourself..."
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;

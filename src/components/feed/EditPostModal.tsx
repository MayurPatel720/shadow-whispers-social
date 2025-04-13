
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ 
  open, 
  onOpenChange, 
  post,
  onSuccess
}) => {
  const [content, setContent] = useState(post?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      // This would be replaced with an actual API call in a real implementation
      // await updatePost(post._id, content);
      
      // For now, we'll simulate an API call with a timeout
      setTimeout(() => {
        toast({
          title: "Post updated",
          description: "Your post has been updated successfully",
        });
        onSuccess();
        onOpenChange(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating post",
        description: "Could not update your post. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="What's on your mind? Your identity will remain anonymous..."
            className="min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
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
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;


import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createPost } from "@/lib/api";
import { Ghost, ImageIcon, Loader2, X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  ghostCircleId?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  ghostCircleId,
}) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      return toast({
        title: "Content required",
        description: "Please add some text or an image to your post.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);
    try {
      await createPost(content, ghostCircleId, imageUrl);
      setContent("");
      setImageUrl("");
      toast({
        title: "Post created",
        description: ghostCircleId 
          ? "Your anonymous post has been shared to the ghost circle." 
          : "Your anonymous post has been shared.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images under 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Create FormData for image upload
    const formData = new FormData();
    formData.append("image", file);

    // Simulate image upload (replace with actual upload logic)
    setTimeout(() => {
      // Mock URL for demo purposes - replace with actual upload logic
      const mockImageUrl = URL.createObjectURL(file);
      setImageUrl(mockImageUrl);
      setIsUploading(false);
    }, 1500);
  };

  const removeImage = () => {
    setImageUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ghostCircleId ? (
              <>
                <Ghost className="h-5 w-5 text-purple-500" />
                Create Ghost Circle Post
              </>
            ) : (
              "Create Anonymous Post"
            )}
          </DialogTitle>
          <DialogDescription>
            {ghostCircleId 
              ? "Your post will only be visible to members of this ghost circle."
              : "Share your thoughts anonymously with the world."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />

          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Post image"
                className="rounded-md w-full max-h-[200px] object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-gray-500"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={isUploading || isSubmitting}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                  </>
                )}
              </Button>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading || isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || (!content.trim() && !imageUrl)}
              className={ghostCircleId ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;

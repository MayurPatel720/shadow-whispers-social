
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
import { Loader, Image as ImageIcon, X } from "lucide-react";
import { createPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ghostCircleId?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  ghostCircleId 
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: "destructive",
        title: "Image too large",
        description: "Please select an image under 5MB"
      });
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    
    setIsSubmitting(true);
    try {
      // In a real implementation, we'd upload the image and get a URL
      // For now, we'll just simulate that with the existing API
      
      // This is a placeholder - in a real app we would upload the image first
      // and then create the post with the image URL
      let imageUrl = imagePreview;
      
      await createPost(content, ghostCircleId);
      setContent("");
      setImagePreview(null);
      setImageFile(null);
      onSuccess();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-purple-600">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="What's on your mind? Your identity will remain anonymous..."
            className="min-h-[120px] bg-gray-700 border-gray-600 focus:border-purple-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          {imagePreview && (
            <div className="relative mt-3 border border-gray-600 rounded-md overflow-hidden">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-90 hover:opacity-100 w-8 h-8"
                onClick={clearImage}
              >
                <X size={16} />
              </Button>
              <img src={imagePreview} alt="Upload preview" className="w-full h-auto max-h-[200px] object-contain" />
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <Button
                variant="outline"
                size="sm"
                className="text-purple-300 border-purple-700"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <ImageIcon size={16} className="mr-2" />
                Add Image
              </Button>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            <p className="text-xs text-gray-400">
              Your post will be visible for 24 hours, and each like extends its life by 1 hour.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-gray-600">
            Cancel
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700" 
            onClick={handleSubmit}
            disabled={(!content.trim() && !imageFile) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Anonymously"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;

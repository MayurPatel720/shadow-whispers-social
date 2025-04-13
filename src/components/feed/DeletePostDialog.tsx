
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSuccess: () => void;
}

const DeletePostDialog: React.FC<DeletePostDialogProps> = ({
  open,
  onOpenChange,
  postId,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // This would be replaced with an actual API call in a real implementation
      // await deletePost(postId);
      
      // For now, we'll simulate an API call with a timeout
      setTimeout(() => {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully",
        });
        onSuccess();
        onOpenChange(false);
        setIsDeleting(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting post",
        description: "Could not delete your post. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePostDialog;

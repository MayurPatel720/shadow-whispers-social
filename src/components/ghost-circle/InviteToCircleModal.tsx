
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ghost, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { inviteToGhostCircle } from "@/lib/api";

const inviteSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

interface InviteToCircleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: string;
  circleName: string;
}

const InviteToCircleModal: React.FC<InviteToCircleModalProps> = ({
  open,
  onOpenChange,
  circleId,
  circleName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof inviteSchema>) => {
    setIsSubmitting(true);
    try {
      await inviteToGhostCircle(circleId, values.username);
      
      toast({
        title: "Invitation sent",
        description: `${values.username} has been invited to ${circleName}`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to invite user:", error);
      toast({
        variant: "destructive",
        title: "Failed to invite user",
        description: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-purple-500" />
            Invite to Ghost Circle
          </DialogTitle>
          <DialogDescription>
            Invite a friend to join "{circleName}". They'll remain anonymous until they choose to reveal their identity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Friend's Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter username" 
                      {...field} 
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isSubmitting ? "Inviting..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteToCircleModal;


import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ReferralTier, PaymentMethod } from "@/types/referral";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { claimReward } from "@/lib/api-referral";
import { toast } from "@/hooks/use-toast";
import { Loader2, Gift } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface ClaimRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: ReferralTier;
}

const formSchema = z.object({
  paymentMethod: z.enum(["paypal", "venmo", "giftcard"], {
    required_error: "Please select a payment method",
  }),
  paymentDetails: z.string().min(5, "Please enter valid payment details"),
});

const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({ open, onOpenChange, tier }) => {
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "paypal",
      paymentDetails: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ tierId, paymentMethod }: { tierId: number, paymentMethod: PaymentMethod }) => 
      claimReward(tierId, paymentMethod),
    onSuccess: (data) => {
      setClaimSubmitted(true);
      toast({
        title: "Reward claim submitted!",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to claim reward",
        description: "Please try again later.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate({ 
      tierId: tier.level, 
      paymentMethod: values.paymentMethod as PaymentMethod 
    });
  };

  const closeAndReset = () => {
    setClaimSubmitted(false);
    form.reset();
    onOpenChange(false);
  };

  const renderPaymentMethodFields = () => {
    const paymentMethod = form.watch("paymentMethod");
    let placeholder = "";
    let label = "";

    switch (paymentMethod) {
      case "paypal":
        placeholder = "name@example.com";
        label = "PayPal Email";
        break;
      case "venmo":
        placeholder = "@username";
        label = "Venmo Username";
        break;
      case "giftcard":
        placeholder = "name@example.com";
        label = "Email for Gift Card";
        break;
    }

    return (
      <FormField
        control={form.control}
        name="paymentDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent className="sm:max-w-[425px]">
        {!claimSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="text-2xl mr-2">{tier.rewardIcon}</span>
                Claim Your {tier.rewardDescription}
              </DialogTitle>
              <DialogDescription>
                {tier.rewardType === "cash" 
                  ? "Choose how you'd like to receive your cash reward"
                  : `Claim your ${tier.rewardDescription} now`}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                {tier.rewardType === "cash" && (
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="paypal"
                                id="paypal"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="paypal"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Gift className="mb-2 h-6 w-6" />
                                PayPal
                              </Label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="venmo"
                                id="venmo"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="venmo"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Gift className="mb-2 h-6 w-6" />
                                Venmo
                              </Label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="giftcard"
                                id="giftcard"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="giftcard"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Gift className="mb-2 h-6 w-6" />
                                Gift Card
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {tier.rewardType === "cash" && renderPaymentMethodFields()}

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Reward
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-5xl mb-4">{tier.rewardIcon}</div>
                <DialogTitle className="text-2xl mb-2">Reward Claimed!</DialogTitle>
                <DialogDescription className="text-center">
                  {tier.rewardType === "cash"
                    ? "Your cash reward has been submitted for processing. You'll receive it within 3-5 business days."
                    : tier.rewardType === "badge"
                    ? "Your badge is now unlocked and visible on your profile!"
                    : "Your premium features have been activated on your account!"}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex justify-center">
              <Button onClick={closeAndReset}>Close</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimRewardModal;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { claimReferralReward } from '@/lib/api';

interface ClaimRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rewardIndex: number;
  rewardName: string;
  onClaimSuccess: () => void;
}

const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
  open,
  onOpenChange,
  rewardIndex,
  rewardName,
  onClaimSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentEmail) {
      toast({ 
        variant: "destructive", 
        title: "Email required", 
        description: "Please enter your payment email address."
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await claimReferralReward(rewardIndex.toString());
      toast({
        title: "Reward claim submitted!",
        description: "We'll process your payment soon.",
      });
      onOpenChange(false);
      onClaimSuccess();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Claim failed", 
        description: error.message || "Could not process your reward claim."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim Your Reward</DialogTitle>
          <DialogDescription>
            You've earned {rewardName}! Fill in your payment details to receive it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="giftcard">Amazon Gift Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-email">Payment Email</Label>
              <Input 
                id="payment-email" 
                type="email" 
                placeholder="your@email.com" 
                value={paymentEmail}
                onChange={(e) => setPaymentEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send your {paymentMethod === 'giftcard' ? 'gift card' : 'payment'} to this email address.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-undercover-purple hover:bg-undercover-deep-purple"
            >
              {isSubmitting ? "Processing..." : "Claim Reward"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimRewardModal;

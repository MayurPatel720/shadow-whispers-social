
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ShareReferralProps {
  referralCode: string;
}

const ShareReferral: React.FC<ShareReferralProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);
  
  // Make sure we have a valid referral code with a fallback
  const validCode = referralCode && referralCode !== 'LOADING' ? referralCode : '';
  
  // Create a proper invitation URL with the referral code
  const shareUrl = `${window.location.origin}/invite?code=${validCode}`;
  const shareMessage = `Unmask the fun—join me on Undercover with code ${validCode}`;
  
  const copyToClipboard = () => {
    if (!validCode) {
      toast({
        title: "No referral code available",
        description: "Please wait for your referral code to be generated",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with your friends to earn rewards",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareOnTwitter = () => {
    if (!validCode) return;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const shareOnFacebook = () => {
    if (!validCode) return;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareOnWhatsapp = () => {
    if (!validCode) return;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="border border-undercover-purple/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Share2 size={18} className="text-undercover-light-purple mr-2" />
          Share Your Invitation
        </CardTitle>
        <CardDescription>Invite friends to earn rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your unique invitation code</label>
          <div className="flex gap-2">
            <Input 
              value={validCode || "Loading your code..."}
              className="font-mono text-lg text-center tracking-wide" 
              readOnly 
            />
            <Button variant="outline" onClick={copyToClipboard} disabled={!validCode}>
              <Copy size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Invitation link</label>
          <div className="flex gap-2">
            <Input 
              value={validCode ? shareUrl : "Loading your invitation link..."}
              className="text-sm" 
              readOnly 
            />
            <Button variant="outline" onClick={copyToClipboard} disabled={!validCode}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">Share on social media</label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={shareOnTwitter} disabled={!validCode}>
              <Twitter size={16} className="mr-2" /> Twitter
            </Button>
            <Button variant="outline" className="flex-1" onClick={shareOnFacebook} disabled={!validCode}>
              <Facebook size={16} className="mr-2" /> Facebook
            </Button>
            <Button variant="outline" className="flex-1" onClick={shareOnWhatsapp} disabled={!validCode}>
              <MessageCircle size={16} className="mr-2" /> WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        For each verified new user who joins with your code, you'll get closer to rewards.
      </CardFooter>
    </Card>
  );
};

export default ShareReferral;

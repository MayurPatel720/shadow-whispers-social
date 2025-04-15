
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
  
  const shareUrl = `${window.location.origin}/invite?code=${referralCode}`;
  const shareMessage = `Unmask the fun—join me on Undercover with code ${referralCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with your friends to earn rewards",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareOnWhatsapp = () => {
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
              value={referralCode} 
              className="font-mono text-lg text-center tracking-wide" 
              readOnly 
            />
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Invitation link</label>
          <div className="flex gap-2">
            <Input 
              value={shareUrl}
              className="text-sm" 
              readOnly 
            />
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">Share on social media</label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={shareOnTwitter}>
              <Twitter size={16} className="mr-2" /> Twitter
            </Button>
            <Button variant="outline" className="flex-1" onClick={shareOnFacebook}>
              <Facebook size={16} className="mr-2" /> Facebook
            </Button>
            <Button variant="outline" className="flex-1" onClick={shareOnWhatsapp}>
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

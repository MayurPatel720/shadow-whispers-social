import React, { useState } from "react";
import {
  Home,
  Search,
  MessageSquare,
  Bell,
  UserRound,
  Users,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperModal from "../whisper/WhisperModal";
import { useAuth } from "@/context/AuthContext";
import AvatarGenerator from "../user/AvatarGenerator";

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active = false, onClick }) => {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`justify-start w-full ${
        active
          ? "bg-undercover-purple/20 text-undercover-light-purple"
          : "text-muted-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
};

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("Home");
  const [whisperModalOpen, setWhisperModalOpen] = useState(false);
  const { user } = useAuth();
  
  const handleTabClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const openWhisperModal = () => {
    setWhisperModalOpen(true);
    setMobileMenuOpen(false);
  };

  const userIdentity = React.useMemo(() => {
    return {
      emoji: user?.avatarEmoji || '🎭',
      nickname: user?.anonymousAlias || 'Anonymous',
      color: '#6E59A5', // Default purple color
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-undercover-light-purple flex items-center">
            <span className="text-2xl mr-2">🕶️</span>
            Undercover
          </h1>
        </div>

        <div className="p-4">
          <div className="bg-undercover-dark rounded-lg p-3 mb-6 border border-undercover-purple/20">
            <AvatarGenerator
              emoji={userIdentity.emoji}
              nickname={userIdentity.nickname}
              color={userIdentity.color}
              size="md"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Your anonymous identity
            </p>
          </div>

          <div className="space-y-1">
            <NavItem
              icon={<Home size={18} />}
              label="Home"
              active={currentTab === "Home"}
              onClick={() => handleTabClick("Home")}
            />
            <NavItem
              icon={<Search size={18} />}
              label="Discover"
              active={currentTab === "Discover"}
              onClick={() => handleTabClick("Discover")}
            />
            <NavItem
              icon={<Users size={18} />}
              label="Ghost Circles"
              active={currentTab === "Circles"}
              onClick={() => handleTabClick("Circles")}
            />
            <NavItem
              icon={<MessageSquare size={18} />}
              label="Whispers"
              active={currentTab === "Whispers"}
              onClick={() => handleTabClick("Whispers")}
            />
            <NavItem
              icon={<Bell size={18} />}
              label="Notifications"
              active={currentTab === "Notifications"}
              onClick={() => handleTabClick("Notifications")}
            />
            <NavItem
              icon={<UserRound size={18} />}
              label="Profile"
              active={currentTab === "Profile"}
              onClick={() => handleTabClick("Profile")}
            />
          </div>

          <Button
            onClick={openWhisperModal}
            className="mt-6 w-full bg-undercover-purple hover:bg-undercover-deep-purple text-white"
          >
            <MessageSquare size={16} className="mr-2" />
            New Whisper
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/95 z-50 flex md:hidden flex-col animate-fade-in">
          <div className="p-4 flex justify-between items-center border-b border-border">
            <h1 className="text-xl font-bold text-undercover-light-purple flex items-center">
              <span className="text-2xl mr-2">🕶️</span>
              Undercover
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X />
            </Button>
          </div>

          <div className="p-4 grow">
            <div className="bg-undercover-dark rounded-lg p-3 mb-6 border border-undercover-purple/20">
              <AvatarGenerator
                emoji={userIdentity.emoji}
                nickname={userIdentity.nickname}
                color={userIdentity.color}
                size="md"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Your anonymous identity
              </p>
            </div>

            <div className="space-y-2">
              <NavItem
                icon={<Home size={18} />}
                label="Home"
                active={currentTab === "Home"}
                onClick={() => handleTabClick("Home")}
              />
              <NavItem
                icon={<Search size={18} />}
                label="Discover"
                active={currentTab === "Discover"}
                onClick={() => handleTabClick("Discover")}
              />
              <NavItem
                icon={<Users size={18} />}
                label="Ghost Circles"
                active={currentTab === "Circles"}
                onClick={() => handleTabClick("Circles")}
              />
              <NavItem
                icon={<MessageSquare size={18} />}
                label="Whispers"
                active={currentTab === "Whispers"}
                onClick={() => handleTabClick("Whispers")}
              />
              <NavItem
                icon={<Bell size={18} />}
                label="Notifications"
                active={currentTab === "Notifications"}
                onClick={() => handleTabClick("Notifications")}
              />
              <NavItem
                icon={<UserRound size={18} />}
                label="Profile"
                active={currentTab === "Profile"}
                onClick={() => handleTabClick("Profile")}
              />
            </div>

            <Button
              onClick={openWhisperModal}
              className="mt-6 w-full bg-undercover-purple hover:bg-undercover-deep-purple text-white"
            >
              <MessageSquare size={16} className="mr-2" />
              New Whisper
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-undercover-light-purple flex items-center">
            <span className="text-xl mr-2">🕶️</span>
            Undercover
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-undercover-light-purple"
              onClick={openWhisperModal}
            >
              <MessageSquare size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>

        <div className="md:hidden fixed bottom-0 w-full bg-card border-t border-border p-2 flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className={currentTab === "Home" ? "text-undercover-light-purple" : "text-muted-foreground"}
            onClick={() => handleTabClick("Home")}
          >
            <Home size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={currentTab === "Discover" ? "text-undercover-light-purple" : "text-muted-foreground"}
            onClick={() => handleTabClick("Discover")}
          >
            <Search size={20} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-undercover-purple text-white"
            onClick={openWhisperModal}
          >
            <PlusCircle size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={currentTab === "Whispers" ? "text-undercover-light-purple" : "text-muted-foreground"}
            onClick={() => handleTabClick("Whispers")}
          >
            <MessageSquare size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={currentTab === "Profile" ? "text-undercover-light-purple" : "text-muted-foreground"}
            onClick={() => handleTabClick("Profile")}
          >
            <UserRound size={20} />
          </Button>
        </div>
      </div>

      <WhisperModal open={whisperModalOpen} onOpenChange={setWhisperModalOpen} />
    </div>
  );
};

export default AppShell;

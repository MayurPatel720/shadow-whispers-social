
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Ghost,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/whispers", icon: MessageCircle, label: "Whispers" },
    { path: "/ghost-circles", icon: Ghost, label: "Ghost Circles" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const renderNavItems = () => (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
            isActive(item.path)
              ? "bg-purple-600 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          }`}
        >
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </>
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md shadow-md text-white"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transform ${
                menuOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-200 ease-in-out`
            : "sticky top-0 h-screen"
        } w-64 bg-gray-800 border-r border-gray-700 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-purple-400">UnderCover</h1>
          <p className="text-xs text-gray-400 mt-1">Anonymously Connected</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">{renderNavItems()}</nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-purple-500 bg-gray-900">
                <AvatarFallback className="bg-gray-900 text-purple-400">
                  {user?.avatarEmoji || "🎭"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">
                  {user?.anonymousAlias || "Anonymous"}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[120px]">
                  {user?.username}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Add padding for mobile menu button */}
        {isMobile && <div className="h-12" />}
        {children}
      </main>
    </div>
  );
};

export default AppShell;

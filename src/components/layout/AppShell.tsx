
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
import { useMobile } from "@/hooks/use-mobile";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isMobile = useMobile();
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
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
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
        } w-64 bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-purple-600">UnderCover</h1>
          <p className="text-xs text-gray-500 mt-1">Anonymously Connected</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">{renderNavItems()}</nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {user?.avatarEmoji || "🎭"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.anonymousAlias || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user?.username}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
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


import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { searchUsers } from "@/lib/api";

interface User {
  _id: string;
  username: string;
  avatarEmoji: string;
  anonymousAlias: string;
}

interface UserSearchInputProps {
  onSelectUser: (username: string) => void;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.length < 1) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setUsers(results);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSelectUser = (username: string) => {
    onSelectUser(username);
    setSearchTerm(username);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search users to invite..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setIsOpen(true)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {loading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      </div>

      {isOpen && users.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {users.map((user) => (
              <li
                key={user._id}
                className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                onClick={() => handleSelectUser(user.username)}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {user.avatarEmoji}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.anonymousAlias}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;

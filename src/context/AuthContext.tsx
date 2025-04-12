
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getUserProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  anonymousAlias: string;
  avatarEmoji: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getUserProfile();
          setUser(userData);
        } catch (error) {
          console.error('Auth token invalid', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      setUser(data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.username}!`,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Login failed', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Registering user with data:', { username, fullName, email });
      const data = await registerUser(username, fullName, email, password);
      console.log('Registration successful, data received:', data);
      
      localStorage.setItem('token', data.token);
      setUser(data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.anonymousAlias}! Your anonymous identity has been created.`,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Registration failed', error);
      
      // More detailed error handling
      let errorMessage = "Registration failed";
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = error.response.data?.message || "Server error: " + error.response.status;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || "Unknown error occurred";
      }
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

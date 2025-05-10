
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('visitvibe_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
    setLoading(false);
  }, []);
  
  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string) => {
    // Simulate API delay
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation - in a real app, this would verify credentials with a server
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // Create a mock user
      const newUser = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email
      };
      
      setUser(newUser);
      localStorage.setItem('visitvibe_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };
  
  // Mock register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid input');
      }
      
      // Create a new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email
      };
      
      setUser(newUser);
      localStorage.setItem('visitvibe_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('visitvibe_user');
    toast.success("Logged out successfully");
  };
  
  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error("User not logged in");
    }
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('visitvibe_user', JSON.stringify(updatedUser));
    return;
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

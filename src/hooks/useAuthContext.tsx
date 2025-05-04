
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('visitvibe_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Mock login function - in a real app, this would make an API call
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - in a real app this would be an API call
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      // Create a mock user
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
      };
      
      // Store user in localStorage
      localStorage.setItem('visitvibe_user', JSON.stringify(mockUser));
      
      // Update state
      setUser(mockUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // Mock signup function - in a real app, this would make an API call
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Mock registration - in a real app this would be an API call
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      // Create a mock user
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
      };
      
      // Store user in localStorage
      localStorage.setItem('visitvibe_user', JSON.stringify(mockUser));
      
      // Update state
      setUser(mockUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Remove user from localStorage
    localStorage.removeItem('visitvibe_user');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

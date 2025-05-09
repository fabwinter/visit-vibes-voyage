
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  const [session, setSession] = useState<Session | null>(null);
  
  // Initialize auth and set up listener for auth changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        
        if (newSession?.user) {
          const userData: User = {
            id: newSession.user.id,
            name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'User',
            email: newSession.user.email || '',
            photo: newSession.user.user_metadata?.avatar_url
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        const userData: User = {
          id: initialSession.user.id,
          name: initialSession.user.user_metadata?.name || initialSession.user.email?.split('@')[0] || 'User',
          email: initialSession.user.email || '',
          photo: initialSession.user.user_metadata?.avatar_url
        };
        setUser(userData);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login function using Supabase
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error?.message || 'Invalid email or password'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function using Supabase
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error?.message || 'Could not create account'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };
  
  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error("User not logged in");
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.photo
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setUser({ ...user, ...updates });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error('Failed to update profile', {
        description: error?.message || 'Unknown error'
      });
      throw error;
    }
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

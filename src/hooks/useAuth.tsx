
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import AuthModal from '@/components/auth/AuthModal';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
  }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{
    error: any | null;
  }>;
  signOut: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{
    error: any | null;
  }>;
  register: (name: string, email: string, password: string) => Promise<{
    error: any | null;
  }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user signs in, redirect to map view
        if (event === 'SIGNED_IN' && window.location.pathname === '/') {
          setTimeout(() => navigate('/map'), 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // If user is already signed in and on the landing page, redirect to map view
      if (session && window.location.pathname === '/') {
        navigate('/map');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        navigate('/map');
      }
      
      return { error };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (!error) {
        navigate('/map');
      }
      
      return { error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateUserProfile = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: data
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  // Add these aliases for backward compatibility
  const login = signIn;
  const register = (name: string, email: string, password: string) => {
    return signUp(email, password, { name });
  };
  const logout = signOut;
  const isAuthenticated = !!user;

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    openAuthModal,
    closeAuthModal,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        initialView="signin"
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

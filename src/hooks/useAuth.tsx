
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import AuthModal from '@/components/auth/AuthModal';
import { ExtendedUser, asExtendedUser } from '@/types/auth';
import { toast } from 'sonner';

type AuthContextType = {
  user: ExtendedUser | null;
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event);
        setSession(session);
        setUser(asExtendedUser(session?.user ?? null));
        
        // If user signs in, redirect to map view
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in');
          setTimeout(() => navigate('/map'), 0);
        } else if (event === 'SIGNED_OUT') {
          toast.info('You have been signed out');
          navigate('/');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Current session:', session ? 'exists' : 'none');
      setSession(session);
      setUser(asExtendedUser(session?.user ?? null));
      setIsLoading(false);
      
      // If user is already signed in and on the landing page, redirect to map view
      if (session && window.location.pathname === '/') {
        navigate('/map');
      }
    }).catch(error => {
      console.error('Error checking session:', error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      }
      
      console.log('Sign in successful:', data);
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      console.log('Signing up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
        return { error };
      }
      
      toast.success('Account created! Please check your email for verification.');
      console.log('Sign up successful:', data);
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: data
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
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

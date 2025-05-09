
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Extended User type with additional properties
export interface ExtendedUser extends SupabaseUser {
  name?: string;
  photo?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for signIn
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>; // Alias for signUp with name
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  loading: boolean;
  isAuthenticated: boolean;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info("Auth state changed:", event);
        
        // Update auth state
        setSession(currentSession);
        
        // Create extended user with additional properties if user exists
        if (currentSession?.user) {
          const userData = currentSession.user.user_metadata || {};
          const extendedUser: ExtendedUser = {
            ...currentSession.user,
            name: userData.name || userData.full_name || currentSession.user.email?.split('@')[0] || 'User',
            photo: userData.avatar_url || userData.photo
          };
          setUser(extendedUser);
        } else {
          setUser(null);
        }
        
        setIsAuthenticated(!!currentSession?.user);
        
        // Show toast for certain events
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
        } else if (event === 'USER_UPDATED') {
          toast.success('User profile updated');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      // Create extended user with additional properties if user exists
      if (currentSession?.user) {
        const userData = currentSession.user.user_metadata || {};
        const extendedUser: ExtendedUser = {
          ...currentSession.user,
          name: userData.name || userData.full_name || currentSession.user.email?.split('@')[0] || 'User',
          photo: userData.avatar_url || userData.photo
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      
      setIsAuthenticated(!!currentSession?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error('Login failed', {
          description: error.message
        });
      }
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Alias for signIn
  const login = signIn;

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        toast.error('Sign up failed', {
          description: error.message
        });
      } else {
        toast.success('Sign up successful', {
          description: 'Please check your email for verification instructions'
        });
      }
    } catch (error) {
      toast.error('Sign up failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Register function that combines name with signUp
  const register = async (name: string, email: string, password: string) => {
    return signUp(email, password, { name });
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      toast.error('Sign out failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Alias for signOut
  const logout = signOut;

  // Add updateUserProfile function
  const updateUserProfile = async (data: any) => {
    try {
      setLoading(true);
      
      // Update the user's metadata
      const { error } = await supabase.auth.updateUser({
        data: data
      });
      
      if (error) {
        toast.error('Profile update failed', {
          description: error.message
        });
        throw error;
      }
      
      // If we got here, the update was successful
      return;
    } catch (error) {
      toast.error('Profile update failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Extend the User type
  if (user) {
    // Add name and photo properties to user object
    const userData = user.user_metadata || {};
    (user as any).name = userData.name || userData.full_name || user.email?.split('@')[0] || 'User';
    (user as any).photo = userData.avatar_url || userData.photo;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      login,
      signUp, 
      register,
      signOut, 
      logout,
      loading, 
      isAuthenticated,
      updateUserProfile
    }}>
      {children}
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

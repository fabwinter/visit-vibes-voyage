import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';

// The basic auth context type
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create a context with no default
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  login: async () => ({ error: 'AuthContext not initialized' }),
  signup: async () => ({ error: 'AuthContext not initialized' }),
  logout: async () => {},
  loading: true,
});

// Mock user for demo purposes - local only
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password',
    photo: 'https://i.pravatar.cc/150?img=68',
  }
];

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create supabase client
  const supabase = createClient(
    'https://ufoousnidesoulsaqdes.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmb291c25pZGVzb3Vsc2FxZGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyNTE3NzMsImV4cCI6MjAzMDgyNzc3M30.P2dNDJIHyPe8LMh6NrFp-S4SVcCIZ4fv5S7h6d_eDFY'
  );

  // Check for session when component mounts
  useEffect(() => {
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Try to log in with Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // If Supabase auth fails and we're in development, try mock login
        if (import.meta.env.DEV) {
          const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
          
          if (mockUser) {
            console.log('Using mock login in development');
            // Create fake user object
            const fakeUser = {
              id: mockUser.id,
              email: mockUser.email,
              user_metadata: { name: mockUser.name, avatar_url: mockUser.photo }
            } as unknown as User;
            
            // Set user state
            setUser(fakeUser);
            setLoading(false);
            
            // Store in localStorage for persistence
            localStorage.setItem('mockUser', JSON.stringify(fakeUser));
            
            return {};
          }
        }
        
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Sign up function
  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) return { error: error.message };
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    // Check for mock user first
    if (import.meta.env.DEV && !session && user) {
      console.log('Mock logout in development');
      localStorage.removeItem('mockUser');
      setUser(null);
      return;
    }
    
    // Otherwise use Supabase logout
    await supabase.auth.signOut();
  };

  // Provide the context value
  const value = {
    user,
    session,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

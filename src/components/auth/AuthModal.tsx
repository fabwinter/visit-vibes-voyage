
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <LoginForm onSuccess={onClose} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            <SignupForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

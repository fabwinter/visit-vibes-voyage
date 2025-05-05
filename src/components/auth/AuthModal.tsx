
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'signin' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialView }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialView);
  
  // Update active tab when initialView changes
  useEffect(() => {
    setActiveTab(initialView);
  }, [initialView]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Welcome to VisitVibe</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-4">
            <SignInForm onSuccess={onClose} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            <SignUpForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

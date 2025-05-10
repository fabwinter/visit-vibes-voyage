
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
      <DialogContent className="sm:max-w-[425px] p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-visitvibe-primary">
            Welcome to VisitVibe
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin" className="text-sm md:text-base py-2">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm md:text-base py-2">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-4 animate-fade-in">
            <SignInForm onSuccess={onClose} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4 animate-fade-in">
            <SignUpForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

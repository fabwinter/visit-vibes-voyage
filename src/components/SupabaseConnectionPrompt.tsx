
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface SupabaseConnectionPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupabaseConnectionPrompt: React.FC<SupabaseConnectionPromptProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="h-5 w-5 text-visitvibe-primary" />
            Connect to Supabase
          </DialogTitle>
          <DialogDescription>
            To unlock all app features, connect your project to Supabase backend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
            <p className="font-medium mb-2">Why connect to Supabase?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Store your visits, venues and wishlist data in a secure database</li>
              <li>Enable proper user authentication and profiles</li>
              <li>Share visits with friends and discover community recommendations</li>
              <li>Enable search and filtering across all your data</li>
              <li>Back up your data automatically</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600">
            Supabase is an open source Firebase alternative with authentication, database, 
            storage, and serverless functions.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => {
            window.open('https://docs.lovable.dev/integrations/supabase/', '_blank');
            onClose();
          }}>
            Connect Supabase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupabaseConnectionPrompt;

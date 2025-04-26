
import { Plus } from 'lucide-react';

interface CheckInButtonProps {
  className?: string;
  onClick?: () => void;
}

const CheckInButton = ({ className = '', onClick }: CheckInButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center bg-visitvibe-primary text-white rounded-full shadow-lg hover:bg-visitvibe-primary/90 focus:outline-none focus:ring-2 focus:ring-visitvibe-primary/50 transition-transform active:scale-95 ${className}`}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default CheckInButton;

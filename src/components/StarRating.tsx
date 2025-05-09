
import { Star as StarIcon } from 'lucide-react';
import { getRatingLevel } from '../types';

interface StarRatingProps {
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  id?: string;
  value?: number;
  onChange?: (value: number) => void;
  required?: boolean;
}

const StarRating = ({ 
  rating = 0, 
  size = 'md', 
  showValue = true, 
  className = '',
  id,
  value,
  onChange,
  required
}: StarRatingProps) => {
  // Use value if provided, otherwise use rating
  const displayValue = value !== undefined ? value : rating;
  const ratingLevel = getRatingLevel(displayValue);
  
  // Determine star size
  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];
  
  // Determine text size
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  // Handle star click when onChange is provided
  const handleStarClick = (starValue: number) => {
    if (onChange) {
      onChange(starValue);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`} id={id}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon 
          key={star} 
          className={`${starSize} ${
            star <= Math.round(displayValue) 
              ? `rating-${ratingLevel} fill-current` 
              : 'text-gray-300'
          } ${onChange ? 'cursor-pointer' : ''}`}
          onClick={() => onChange && handleStarClick(star)}
        />
      ))}
      
      {showValue && (
        <span className={`ml-1 font-medium rating-${ratingLevel} ${textSize}`}>
          {displayValue.toFixed(1)}
        </span>
      )}
      {required && <span className="text-red-500 ml-1">*</span>}
    </div>
  );
};

export default StarRating;

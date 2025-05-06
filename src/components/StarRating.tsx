
import { Star as StarIcon } from 'lucide-react';
import { getRatingLevel } from '../types';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

const StarRating = ({ 
  value, 
  size = 'md', 
  showValue = true, 
  className = '',
  readOnly = false,
  onChange
}: StarRatingProps) => {
  const ratingLevel = getRatingLevel(value);
  
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

  const handleStarClick = (starValue: number) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon 
          key={star} 
          className={`${starSize} ${
            star <= Math.round(value) 
              ? `rating-${ratingLevel} fill-current` 
              : 'text-gray-300'
          } ${!readOnly ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(star)}
        />
      ))}
      
      {showValue && (
        <span className={`ml-1 font-medium rating-${ratingLevel} ${textSize}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

export type { StarRatingProps };

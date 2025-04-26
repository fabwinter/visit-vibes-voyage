
import { Star as StarIcon } from 'lucide-react';
import { getRatingLevel } from '../types';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const StarRating = ({ 
  rating, 
  size = 'md', 
  showValue = true, 
  className = '' 
}: StarRatingProps) => {
  const ratingLevel = getRatingLevel(rating);
  
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
  
  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon 
          key={star} 
          className={`${starSize} ${
            star <= Math.round(rating) 
              ? `rating-${ratingLevel} fill-current` 
              : 'text-gray-300'
          }`}
        />
      ))}
      
      {showValue && (
        <span className={`ml-1 font-medium rating-${ratingLevel} ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

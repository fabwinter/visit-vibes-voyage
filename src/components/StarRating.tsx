
import { Star as StarIcon } from 'lucide-react';
import { getRatingLevel } from '../types';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  size = 'md', 
  showValue = true,
  className = '',
  editable = false,
  onChange
}: StarRatingProps) => {
  const ratingLevel = getRatingLevel(rating);
  const [hoverRating, setHoverRating] = useState(0);
  
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

  const handleClick = (selectedRating: number) => {
    if (editable && onChange) {
      onChange(selectedRating);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || Math.round(rating));
        return (
          <StarIcon 
            key={star} 
            className={`${starSize} ${
              isActive
                ? `rating-${ratingLevel} fill-current`
                : 'text-gray-300'
            } ${editable ? 'cursor-pointer transition-all duration-100' : ''}`}
            onMouseEnter={() => editable && setHoverRating(star)}
            onMouseLeave={() => editable && setHoverRating(0)}
            onClick={() => handleClick(star)}
          />
        );
      })}
      
      {showValue && (
        <span className={`ml-1 font-medium rating-${ratingLevel} ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

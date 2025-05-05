
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ 
  value, 
  onChange,
  readOnly = false,
  size = 'md'
}) => {
  // Size mapping
  const sizeMap = {
    xs: { star: 12, container: 'gap-0.5' },
    sm: { star: 16, container: 'gap-1' },
    md: { star: 20, container: 'gap-1.5' },
    lg: { star: 24, container: 'gap-2' }
  };
  
  const currentSize = sizeMap[size];
  
  // Handle star click
  const handleStarClick = (rating: number) => {
    if (readOnly) return;
    onChange?.(rating);
  };

  return (
    <div className={`flex ${currentSize.container} items-center`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={currentSize.star}
          className={`cursor-pointer ${
            star <= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => handleStarClick(star)}
          data-testid={`star-${star}`}
        />
      ))}
    </div>
  );
};

export default StarRatingInput;

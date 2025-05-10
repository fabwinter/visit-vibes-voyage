
import { useState, useEffect } from 'react';
import { Visit } from '@/types';
import { toast } from 'sonner';

export const useVisitData = () => {
  const [visits, setVisits] = useState<Visit[]>([]);

  // Load visits from localStorage
  useEffect(() => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
  }, []);
  
  // Save visits to localStorage when they change
  useEffect(() => {
    if (visits.length > 0) {
      localStorage.setItem('visits', JSON.stringify(visits));
    }
  }, [visits]);

  // Process the check-in data
  const processCheckIn = (visit: Visit) => {
    // Add the new visit
    const updatedVisits = [visit, ...visits];
    setVisits(updatedVisits);
    
    // Save visits to localStorage
    localStorage.setItem('visits', JSON.stringify(updatedVisits));
    
    toast.success("Check-in successful!");
  };

  return {
    visits,
    processCheckIn
  };
};


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

  // Process the check-in data - now handles both new and edited visits
  const processCheckIn = (visit: Visit) => {
    // Check if this is an edit of an existing visit
    const existingVisitIndex = visits.findIndex(v => v.id === visit.id);
    
    let updatedVisits;
    if (existingVisitIndex !== -1) {
      // Update the existing visit
      updatedVisits = [...visits];
      updatedVisits[existingVisitIndex] = visit;
      toast.success("Check-in updated!");
    } else {
      // Add the new visit
      updatedVisits = [visit, ...visits];
      toast.success("Check-in successful!");
    }
    
    setVisits(updatedVisits);
    
    // Save visits to localStorage
    localStorage.setItem('visits', JSON.stringify(updatedVisits));
    
    return visit;
  };

  return {
    visits,
    processCheckIn
  };
};

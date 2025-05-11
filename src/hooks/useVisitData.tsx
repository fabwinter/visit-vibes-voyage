
import { useState, useEffect } from 'react';
import { Visit } from '@/types';
import { toast } from 'sonner';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const useVisitData = () => {
  const [visits, setVisits] = useState<Visit[]>([]);

  // Load visits from localStorage with compression handling
  useEffect(() => {
    try {
      const storedVisits = localStorage.getItem('visits');
      if (storedVisits) {
        // Try to parse as regular JSON first (for backward compatibility)
        try {
          setVisits(JSON.parse(storedVisits));
        } catch (e) {
          // If regular parsing fails, try to decompress first
          const decompressed = decompressFromUTF16(storedVisits);
          if (decompressed) {
            setVisits(JSON.parse(decompressed));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load visits:", error);
      toast.error("Failed to load visit history");
    }
  }, []);
  
  // Save visits to localStorage with compression when they change
  useEffect(() => {
    if (visits.length > 0) {
      try {
        // Use compression to reduce storage size
        const visitsJson = JSON.stringify(visits);
        const compressed = compressToUTF16(visitsJson);
        
        localStorage.setItem('visits', compressed);
      } catch (error) {
        console.error("Failed to save visits:", error);
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error("Storage limit reached! Try removing some old visits.");
        } else {
          toast.error("Failed to save visit data");
        }
      }
    }
  }, [visits]);

  // Process the check-in data with error handling
  const processCheckIn = (visit: Visit) => {
    try {
      // Add the new visit
      const updatedVisits = [visit, ...visits];
      
      // Check if we need to trim the visits array to prevent storage issues
      const maxVisits = 100; // Set a reasonable limit
      const trimmedVisits = updatedVisits.slice(0, maxVisits);
      
      if (updatedVisits.length > maxVisits) {
        toast.info(`Keeping only the most recent ${maxVisits} visits to save space.`);
      }
      
      setVisits(trimmedVisits);
      
      // Save is handled by the effect above
      toast.success("Check-in successful!");
    } catch (error) {
      console.error("Error during check-in:", error);
      toast.error("Failed to save check-in");
    }
  };

  return {
    visits,
    processCheckIn
  };
};

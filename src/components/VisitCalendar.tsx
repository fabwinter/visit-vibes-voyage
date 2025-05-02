
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Visit } from '@/types';
import { format, isEqual, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface VisitCalendarProps {
  visits: Visit[];
  onDateFilterChange: (dateRange: { from?: Date; to?: Date }) => void;
}

const VisitCalendar = ({ visits, onDateFilterChange }: VisitCalendarProps) => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  // Get unique dates that have visits
  const visitDates = visits.map(visit => new Date(visit.timestamp));

  // Group visits by date
  const visitsByDate = visits.reduce((acc, visit) => {
    const visitDate = format(new Date(visit.timestamp), 'yyyy-MM-dd');
    if (!acc[visitDate]) {
      acc[visitDate] = [];
    }
    acc[visitDate].push(visit);
    return acc;
  }, {} as Record<string, Visit[]>);

  // Function to show count of visits on a particular day
  const getDayContent = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    const dayVisits = visitsByDate[formattedDay];
    
    if (dayVisits && dayVisits.length > 0) {
      return (
        <div className="relative h-full w-full flex items-center justify-center">
          <Badge className="absolute bottom-0 right-0 text-[8px] min-w-[16px] h-4 flex items-center justify-center bg-visitvibe-primary">
            {dayVisits.length}
          </Badge>
        </div>
      );
    }
    
    return null;
  };

  // When date selection changes
  const onSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      onDateFilterChange({});
      return;
    }
    
    // If the same day is selected twice, clear the selection
    if (date?.from && isSameDay(date.from, selectedDate)) {
      setDate(undefined);
      onDateFilterChange({});
      return;
    }

    // If we have a from date but not a to date, add the to date
    if (date?.from && !date?.to) {
      const newDateRange: DateRange = {
        from: date.from,
        to: selectedDate
      };
      setDate(newDateRange);
      onDateFilterChange(newDateRange);
      return;
    }

    // First selection or selection after complete range
    const newDateRange: DateRange = { from: selectedDate, to: undefined };
    setDate(newDateRange);
    onDateFilterChange({
      from: selectedDate
    });
  };

  // Function to highlight dates with visits
  const isDayWithVisit = (day: Date) => {
    return visitDates.some(visitDate => 
      isSameDay(visitDate, day) && 
      isSameMonth(visitDate, day) && 
      isSameYear(visitDate, day)
    );
  };

  // Function to reset date filter
  const handleReset = () => {
    setDate(undefined);
    onDateFilterChange({});
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Filter by Date</h3>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM d")} - {format(date.to, "MMM d")}
                      </>
                    ) : (
                      format(date.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Select dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={(range) => {
                    setDate(range);
                    // Convert to our expected format for the parent component
                    onDateFilterChange({
                      from: range?.from,
                      to: range?.to
                    });
                  }}
                  modifiers={{ withVisits: isDayWithVisit }}
                  modifiersStyles={{
                    withVisits: { border: '2px solid var(--visitvibe-primary)' }
                  }}
                  className={cn("p-3 pointer-events-auto")}
                  components={{
                    DayContent: ({ date: day }) => (
                      <>
                        <span>{format(day, 'd')}</span>
                        {getDayContent(day)}
                      </>
                    ),
                  }}
                />
              </PopoverContent>
            </Popover>
            {date && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8">
                Reset
              </Button>
            )}
          </div>
        </div>
        {date?.from && (
          <div className="text-sm text-gray-500">
            Showing visits from {format(date.from, "MMM d, yyyy")}
            {date.to && ` to ${format(date.to, "MMM d, yyyy")}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitCalendar;

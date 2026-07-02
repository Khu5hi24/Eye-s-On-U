'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onChange,
  className
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Today's date with zeroed time for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    selected.setMinutes(selected.getMinutes() - selected.getTimezoneOffset()); // Adjust to local timezone ISO date
    const dateStr = selected.toISOString().split('T')[0];
    onChange(dateStr);
  };

  // Generate date cells
  const dateCells = [];
  
  // Empty cells for padding before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    dateCells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);
    const isPast = dateToCheck < today;
    
    // Check if selected
    const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if today
    const isToday = today.getTime() === dateToCheck.getTime();

    dateCells.push(
      <button
        key={`day-${day}`}
        type="button"
        disabled={isPast}
        onClick={() => handleDateClick(day)}
        className={cn(
          "h-9 w-9 text-sm rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-hidden",
          isPast 
            ? "text-muted-foreground/30 cursor-not-allowed line-through" 
            : "hover:bg-secondary hover:text-secondary-foreground cursor-pointer font-medium",
          isSelected && !isPast && "bg-primary text-primary-foreground hover:bg-primary/95 scale-105 shadow-xs",
          isToday && !isSelected && "border border-primary/50 text-primary font-bold dark:text-primary-foreground"
        )}
      >
        {day}
      </button>
    );
  }

  return (
    <div className={cn("p-4 border border-border bg-card rounded-xl shadow-md w-72 max-w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dateCells}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-[11px] text-muted-foreground">
        <CalendarIcon className="h-3 w-3" />
        <span>Selected Due Date: {selectedDate ? selectedDate : 'None'}</span>
      </div>
    </div>
  );
};

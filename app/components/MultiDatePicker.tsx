'use client'

import { useState, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import { Check, X } from 'lucide-react'
import { format, isAfter, isBefore, isSameDay } from 'date-fns'

interface MultiDatePickerProps {
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  maxAppointments: number;
  setMaxAppointments: React.Dispatch<React.SetStateAction<number>>;
  handleSave: () => void;
}

export default function MultiDatePicker({
  selectedDates,
  setSelectedDates,
  maxAppointments,
  setMaxAppointments,
  handleSave
}: MultiDatePickerProps) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);

  // Generate dates between two dates
  const getDatesInRange = useCallback((startDate: Date, endDate: Date) => {
    const result: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }, []);

  // Handle date selection
  const handleDateChange = useCallback((date: Date) => {
    if (rangeStart) {
      // If we already have a range start, create the range and reset
      const datesInRange = getDatesInRange(rangeStart, date);
      setSelectedDates(prev => {
        const newDates = [...prev];
        
        // Add dates that don't already exist in the selection
        datesInRange.forEach(d => {
          if (!newDates.some(existing => isSameDay(existing, d))) {
            newDates.push(d);
          }
        });
        
        return newDates;
      });
      
      setRangeStart(null);
    } else {
      // Check if date is already selected
      const dateExists = selectedDates.some(d => isSameDay(d, date));
      
      if (dateExists) {
        // Remove date if already selected
        setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
      } else {
        // Start a range or add a single date
        if (hoverDate) {
          setRangeStart(date);
        } else {
          setSelectedDates([...selectedDates, date]);
        }
      }
    }
  }, [rangeStart, hoverDate, selectedDates, getDatesInRange, setSelectedDates]);

  const handleClearSelection = useCallback(() => {
    setSelectedDates([]);
    setRangeStart(null);
  }, [setSelectedDates]);

  const dayClassName = useCallback((date: Date) => {
    const isSelected = selectedDates.some(d => isSameDay(d, date));

    let isInRange = false;
    if (rangeStart && hoverDate) {
      const isAfterStart = isAfter(date, rangeStart) || isSameDay(date, rangeStart);
      const isBeforeHover = isBefore(date, hoverDate) || isSameDay(date, hoverDate);
      isInRange = isAfterStart && isBeforeHover;
    }

    // Base size and alignment for each day cell
    let className = "w-9 h-9 grid place-content-center rounded-md text-gray-300 transition-colors duration-150 ";

    if (isSelected) {
      className += "!bg-pink-500 !text-white !font-bold ring-1 ring-pink-400";
    } else if (isInRange) {
      className += "bg-pink-500/20 text-pink-200";
    } else {
      className += "hover:bg-white/10";
    }

    return className;
  }, [selectedDates, rangeStart, hoverDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-medium">Select Multiple Dates</h4>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Max appointments per date:</label>
          <input
            type="number"
            className="w-16 px-2 py-1 rounded border dark:bg-gray-700 dark:border-gray-600"
            value={maxAppointments}
            onChange={e => setMaxAppointments(parseInt(e.target.value) || 1)}
            min="1"
            max="50"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedDates.map((date, index) => (
          <div 
            key={date.toISOString()} 
            className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md"
          >
            <span className="mr-1">{format(date, 'MMM dd, yyyy')}</span>
            <button
              onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <div 
        className="relative flex items-center justify-center"
        onMouseLeave={() => setHoverDate(null)}
      >
        <DatePicker
          inline
          selected={null}
          onChange={(date: Date | null) => {
            // This is required by DatePicker props
          }}
          onSelect={(date: Date) => {
            if (date) handleDateChange(date);
          }}
          onChangeRaw={(e: React.SyntheticEvent) => e.preventDefault()}
          onKeyDown={(e: React.KeyboardEvent) => e.preventDefault()}
          onDayMouseEnter={(date: Date) => setHoverDate(date)}
          dayClassName={dayClassName}
          minDate={new Date()}
          monthsShown={1}
          disabledKeyboardNavigation
          calendarClassName="admin-date-picker w-full max-w-md"
        />
      </div>
      
      <div className="flex justify-between pt-2">
        <button 
          onClick={handleClearSelection} 
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Clear Selection
        </button>
        <button 
          onClick={handleSave} 
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
          disabled={selectedDates.length === 0}
        >
          <span>Save Dates</span>
          <Check size={16} />
        </button>
      </div>
    </div>
  );
} 
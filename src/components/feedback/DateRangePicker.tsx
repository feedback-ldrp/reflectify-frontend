"use client";

import React, { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Essential for styling the DayPicker
import showToast from "@/lib/toast";

// Define the props for the component if it were to be reusable
interface DateRangePickerProps {
  initialStartDate?: string;
  initialEndDate?: string;
  onDateRangeChange: (startDate?: string, endDate?: string) => void;
}

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
  initialStartDate,
  initialEndDate,
  onDateRangeChange,
}) => {
  // State to hold the selected date range from DayPicker
  // 'from' corresponds to the start date, 'to' corresponds to the end date
  const [range, setRange] = useState<DateRange | undefined>(() => {
    // Initialize the range from props if provided
    const from = initialStartDate ? new Date(initialStartDate) : undefined;
    const to = initialEndDate ? new Date(initialEndDate) : undefined;
    return { from, to };
  });

  // Handler for when a date (or range) is selected in the DayPicker
  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.to && selectedRange.to < new Date()) {
      // Display an error toast if the end date is before the current date
      showToast.error("Invalid End date.");
      return;
    }

    setRange(selectedRange); // Update the internal state of the component

    // Convert Date objects to ISO strings for external use
    const newStartDate = selectedRange?.from
      ? selectedRange.from.toISOString()
      : undefined;
    const newEndDate = selectedRange?.to
      ? selectedRange.to.toISOString()
      : undefined;

    // Call the provided callback function to pass the dates up to the parent component
    onDateRangeChange(newStartDate, newEndDate);
  };

  return (
    <div className="rounded-lg shadow-md flex flex-col items-center">
      {/* DayPicker component */}
      <DayPicker
        animate
        mode={"range"} // Enables range selection
        selected={range} // Binds the selected range to the component's state
        onSelect={handleSelect} // Handles date selection
        navLayout="around" // Places navigation buttons around the caption
        required // Makes selection mandatory (visually, not for validation)
        // showOutsideDays // Shows days from previous/next months
        className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background "
        // Custom styles for DayPicker elements (Tailwind CSS classes)
        classNames={{
          // root: `${cls.root}`,
          selected: `text-white p-1`,
          day: `hover:bg-light-hover hover:text-light-text dark:hover:text-dark-text dark:hover:bg-dark-hover p-1`,
          today: `font-bold text-primary-dark`,
          range_start:
            "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-l-xl",
          range_middle: `bg-primary-main/60 dark:bg-primary-darker/60 text-light-text dark:text-dark-text`,
          range_end:
            "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-r-xl",
          nav_button: "text-light-highlight dark:text-dark-highlight",
        }}
        styles={{
          caption: { color: "#f97316" },
          day_selected: {
            accentColor: "#f97316",
            color: "black",
          },
          day_range_middle: {
            accentColor: "#f97316",
            color: "#f97316",
            borderRadius: "0.5rem",
          },
          day_today: {
            color: "#f97316",
          },
          // Optional: Style for the navigation buttons if they are not picking up theme colors
          nav_button: {
            color: "#f97316",
          },
          nav_button_next: {
            color: "#f97316",
          },
          nav_button_previous: {
            color: "#f97316",
          },
        }}
      />
    </div>
  );
};

export default DateRangePickerComponent;

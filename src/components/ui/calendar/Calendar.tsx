import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils";

interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selected?: Date;
  onSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  modifiers?: any;
  modifiersClassNames?: any;
  mode?: any;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, selected, onSelect, month: controlledMonth, onMonthChange, modifiers, modifiersClassNames, mode, ...props }, ref) => {
    const today = new Date();
    const [internalMonth, setInternalMonth] = React.useState(controlledMonth ?? today);
    const currentMonth = controlledMonth ?? internalMonth;

    const year = currentMonth.getFullYear();
    const monthIdx = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, monthIdx);
    const firstDay = getFirstDayOfMonth(year, monthIdx);

    const navigateMonth = (delta: number) => {
      const newMonth = new Date(year, monthIdx + delta, 1);
      if (controlledMonth === undefined) setInternalMonth(newMonth);
      onMonthChange?.(newMonth);
    };

    const isToday = (day: number) =>
      today.getDate() === day && today.getMonth() === monthIdx && today.getFullYear() === year;

    const isSelected = (day: number) =>
      selected && selected.getDate() === day && selected.getMonth() === monthIdx && selected.getFullYear() === year;

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div ref={ref} data-slot="calendar" className={cn("bg-background p-2 w-fit", className)} {...props}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => navigateMonth(-1)} className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium select-none">{MONTHS[monthIdx]} {year}</span>
          <button type="button" onClick={() => navigateMonth(1)} className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map((d) =>
            <div key={d} className="flex size-7 items-center justify-center text-[0.8rem] text-muted-foreground select-none">{d}</div>
          )}
          {days.map((day, i) =>
            <div key={i} className="flex size-7 items-center justify-center">
              {day &&
                <button
                  type="button"
                  onClick={() => onSelect?.(new Date(year, monthIdx, day))}
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted",
                    isToday(day) && "bg-muted font-medium",
                    isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary/80"
                  )}>

                  {day}
                </button>
              }
            </div>
          )}
        </div>
      </div>);

  }
);
Calendar.displayName = "Calendar";

export { Calendar };
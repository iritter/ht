import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from "@/lib/utils";

export default function WeekStrip({ selectedDate, onSelectDate, logsMap }) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex gap-2">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isSelected = isSameDay(day, selectedDate);
        const today = isToday(day);
        const dayLogs = logsMap[dateStr] || [];
        const hasActivity = dayLogs.length > 0;

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDate(day)}
            className={cn(
              "flex-1 flex flex-col items-center py-3 rounded-2xl transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg"
                : today
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            <span className="text-[10px] font-semibold uppercase">{format(day, 'EEE')}</span>
            <span className={cn(
              "text-lg font-bold mt-0.5",
              isSelected ? "text-primary-foreground" : "text-foreground"
            )}>
              {format(day, 'd')}
            </span>
            {hasActivity && !isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
            )}
            {hasActivity && isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
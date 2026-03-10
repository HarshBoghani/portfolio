'use client';

import { useState, useMemo } from 'react';
import { useCFSubmissions } from '@/hooks/use-codeforces';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

const YEARS = [2026, 2025, 2024];

export default function Heatmap({ handle }: { handle: string }) {
  const { data: submissions, isLoading, isError } = useCFSubmissions(handle);
  const [selectedYear, setSelectedYear] = useState(2024); // Default to 2024 per requirements

  const { days, maxCount, countsMap } = useMemo(() => {
    if (!submissions) return { days: [], maxCount: 0, countsMap: new Map() };

    const startDate = startOfYear(new Date(selectedYear, 0, 1));
    const endDate = endOfYear(startDate);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Filter submissions for this year and group by day
    const counts = new Map<string, number>();
    let localMax = 0;

    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000);
      if (date.getFullYear() === selectedYear) {
        const key = format(date, 'yyyy-MM-dd');
        const count = (counts.get(key) || 0) + 1;
        counts.set(key, count);
        if (count > localMax) localMax = count;
      }
    });

    return { days: allDays, maxCount: localMax, countsMap: counts };
  }, [submissions, selectedYear]);

  // Group days into weeks (columns)
  const weeks = useMemo(() => {
    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Pad first week with nulls if it doesn't start on Sunday
    if (days.length > 0) {
      const firstDay = getDay(days[0]);
      for (let i = 0; i < firstDay; i++) {
        currentWeek.push(null as unknown as Date);
      }
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // Pad last week
      while (currentWeek.length < 7) {
        currentWeek.push(null as unknown as Date);
      }
      weeksArr.push(currentWeek);
    }

    return weeksArr;
  }, [days]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-neutral-200 dark:bg-neutral-800/50 border-neutral-300/20 dark:border-neutral-700/50';
    // 4 levels of intensity using GitHub-style green palette
    const intensity = Math.ceil((count / maxCount) * 4);
    if (intensity === 1) return 'bg-[#9be9a8] border-[#9be9a8]';
    if (intensity === 2) return 'bg-[#40c463] border-[#40c463]';
    if (intensity === 3) return 'bg-[#30a14e] border-[#30a14e]';
    return 'bg-[#216e39] border-[#216e39]';
  };

  if (isLoading) {
    return (
      <div className="w-full glass-panel rounded-xl p-6 flex flex-col items-center justify-center min-h-[250px] border border-border/70 bg-background/90">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
        <span className="font-mono text-sm text-emerald-500 animate-pulse">Compiling submission history...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full glass-panel rounded-xl p-6 border border-red-500/20 text-red-500 font-mono flex items-center justify-center min-h-[250px] bg-background/90">
        Failed to map submissions.
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-xl p-6 border border-border/70 bg-background/90 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="font-display font-medium text-lg text-neutral-800 dark:text-neutral-200">Algorithmic Output</h3>
          <p className="font-mono text-xs text-neutral-500 mt-1">Codeforces Activity Matrix</p>
        </div>
        
        <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1 border border-border/50">
          {YEARS.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-md text-sm font-mono transition-all duration-300 ${
                selectedYear === year 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="inline-flex gap-[3px] min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => {
                if (!day) return <div key={`empty-${dayIndex}`} className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] bg-transparent" />;
                
                const dateKey = format(day, 'yyyy-MM-dd');
                const count = countsMap.get(dateKey) || 0;
                
                return (
                  <div
                    key={dateKey}
                    title={`${count} submissions on ${format(day, 'MMM d, yyyy')}`}
                    className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px] border transition-all duration-200 hover:scale-125 hover:z-10 ${getColor(count)}`}
                    style={{ 
                      animationDelay: `${(weekIndex * 15) + (dayIndex * 5)}ms` 
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end items-center gap-2 font-mono text-[10px] sm:text-xs text-neutral-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-neutral-200 dark:bg-neutral-800/50 border border-neutral-300/20 dark:border-neutral-700/50" />
          <div className="w-3 h-3 rounded-[2px] bg-[#9be9a8]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#40c463]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#30a14e]" />
          <div className="w-3 h-3 rounded-[2px] bg-[#216e39]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

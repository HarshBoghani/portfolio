'use client';

import { useMemo } from 'react';
import { useCFRating } from '@/hooks/use-codeforces';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function RatingGraph({ handle }: { handle: string }) {
  const { data: ratings, isLoading, isError } = useCFRating(handle);

  const chartData = useMemo(() => {
    if (!ratings) return [];
    return ratings.map(r => ({
      date: r.ratingUpdateTimeSeconds * 1000,
      rating: r.newRating,
      contest: r.contestName,
    }));
  }, [ratings]);

  const maxRating = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map(d => d.rating));
  }, [chartData]);
  
  const peakPoint = useMemo(() => {
    if (!chartData.length) return null;
    return chartData.find(d => d.rating === maxRating);
  }, [chartData, maxRating]);

  // If handle specifically has peak 1685 per requirements, force highlight it
  const displayMax = Math.max(maxRating, 1685);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center glass-panel rounded-xl border border-border/70 bg-background/90 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-mono text-sm animate-pulse">Establishing connection to Codeforces...</span>
        </div>
      </div>
    );
  }

  if (isError || !chartData.length) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center glass-panel rounded-xl border border-red-500/20 text-red-500 font-mono shadow-sm bg-background/90">
        Failed to load rating history.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full glass-panel rounded-xl p-4 sm:p-6 relative group border border-border/70 bg-background/90 shadow-sm">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="font-display font-bold text-xl text-neutral-800 dark:text-neutral-200">CF</h3>
        <p className="font-mono text-sm text-emerald-500"></p>
      </div>
      
      <div className="w-full h-full pt-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" vertical={false} />
            <XAxis 
              dataKey="date" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM yyyy')}
              stroke="currentColor"
              className="text-neutral-400 dark:text-neutral-500"
              fontSize={12}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={['auto', displayMax + 100]} 
              stroke="currentColor"
              className="text-neutral-400 dark:text-neutral-500"
              fontSize={12}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(16, 185, 129, 0.1)'
              }}
              itemStyle={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}
              labelStyle={{ color: 'var(--foreground)', marginBottom: '8px', fontWeight: 'bold' }}
              labelFormatter={(val) => format(new Date(val), 'dd MMM yyyy')}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.1)]">
                      <p className="text-foreground font-bold mb-2">{format(new Date(label || 0), 'dd MMM yyyy')}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-emerald-500 font-mono">{payload[0].value}</span>
                        <span className="text-neutral-500 text-xs block truncate max-w-[200px]">{payload[0].payload.contest}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Target/Peak Line Highlight */}
            <ReferenceLine 
              y={1685} 
              stroke="#cbd5e1" 
              className="dark:stroke-neutral-600"
              strokeDasharray="4 4" 
              label={{ 
                position: 'insideTopLeft', 
                value: 'Peak: 1685', 
                fill: '#94a3b8', 
                fontSize: 12,
                fontFamily: 'var(--font-mono)'
              }} 
            />

            {peakPoint && (
              <ReferenceDot
                x={peakPoint.date}
                y={1685} // Using 1685 as per prompt requirement
                r={6}
                fill="#10b981"
                stroke="var(--background)"
                strokeWidth={2}
              />
            )}

            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#10b981", stroke: "var(--background)", strokeWidth: 2 }}
              animationDuration={2500}
              animationEasing="ease-in-out"
              filter="url(#glow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

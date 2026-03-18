import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target } from 'lucide-react';

export default function DailyProgress({ totalPoints, earnedPoints, completedCount, totalCount }) {
  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return (
    <div className="bg-card rounded-3xl border p-6 space-y-5">
      {/* Points circle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold text-foreground">{earnedPoints}</span>
            <span className="text-lg text-muted-foreground font-medium">/ {totalPoints}</span>
          </div>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <motion.circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - percentage / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Target className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{completedCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase">Done</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-lg font-bold text-foreground">{totalCount - completedCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase">Left</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Trophy className="w-4 h-4 mx-auto text-amber-500 mb-1" />
          <p className="text-lg font-bold text-foreground">{earnedPoints}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase">Points</p>
        </div>
      </div>
    </div>
  );
}
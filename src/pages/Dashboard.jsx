import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playCompletionSound } from '@/components/habits/useCompletionSound';
import { differenceInDays, parseISO, getDay } from 'date-fns';
import WeekStrip from '@/components/habits/WeekStrip';
import DailyProgress from '@/components/habits/DailyProgress';
import HabitCard from '@/components/habits/HabitCard';
import AddHabitDialog from '@/components/habits/AddHabitDialog';
import PartnerSettings, { getPartnerEmail } from '@/components/habits/PartnerSettings';
import UserProfileSettings from '@/components/UserProfileSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState(getPartnerEmail());
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list(),
  });

  const { data: allLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['habitLogs'],
    queryFn: () => base44.entities.HabitLog.list('-created_date', 500),
  });

  const activeHabits = useMemo(() => {
    return habits.filter(h => {
      if (h.is_active === false) return false;
      const freq = h.frequency || 'daily';
      if (freq === 'daily') return true;
      if (freq === 'weekly') {
        const weekdays = h.frequency_weekdays || [0, 1, 2, 3, 4];
        const jsDay = getDay(selectedDate);
        const ourDay = jsDay === 0 ? 6 : jsDay - 1;
        return weekdays.includes(ourDay);
      }
      if (freq === 'custom') {
        const days = h.frequency_days || 2;
        const refDate = parseISO(h.created_date ? h.created_date.split('T')[0] : dateStr);
        const diff = differenceInDays(selectedDate, refDate);
        return diff >= 0 && diff % days === 0;
      }
      return true;
    });
  }, [habits, selectedDate, dateStr]);

  const logsMap = useMemo(() => {
    const map = {};
    allLogs.forEach(log => {
      if (!map[log.date]) map[log.date] = [];
      map[log.date].push(log);
    });
    return map;
  }, [allLogs]);

  const todayLogs = useMemo(() => logsMap[dateStr] || [], [logsMap, dateStr]);

  const completedIds = useMemo(() => {
    const set = new Set();
    todayLogs.filter(l => l.completed && l.created_by === currentUser?.email).forEach(l => set.add(l.habit_id));
    return set;
  }, [todayLogs, currentUser]);

  const earnedPoints = useMemo(() => {
    return activeHabits.filter(h => completedIds.has(h.id)).reduce((sum, h) => sum + (h.points || 10), 0);
  }, [activeHabits, completedIds]);

  const totalPoints = useMemo(() => {
    return activeHabits.reduce((sum, h) => sum + (h.points || 10), 0);
  }, [activeHabits]);

  const toggleMutation = useMutation({
    mutationFn: async (habit) => {
      const existingLog = todayLogs.find(l => l.habit_id === habit.id && l.created_by === currentUser?.email);
      if (existingLog) {
        const newCompleted = !existingLog.completed;
        await base44.entities.HabitLog.update(existingLog.id, { completed: newCompleted });
        if (newCompleted) playCompletionSound();
      } else {
        await base44.entities.HabitLog.create({ habit_id: habit.id, date: dateStr, completed: true });
        playCompletionSound();
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habitLogs'] }),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Habit.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (habit) => base44.entities.Habit.delete(habit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const isLoading = habitsLoading || logsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Habits</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{format(selectedDate, 'EEEE, MMM d')}</p>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/Chat">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/Stats">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <BarChart2 className="w-5 h-5" />
              </Button>
            </Link>
            <UserProfileSettings onSave={setCurrentUser} />
            <PartnerSettings onSave={() => setPartnerEmail(getPartnerEmail())} />
            <AddHabitDialog
              onAdd={(data) => addMutation.mutateAsync(data)}
              currentUserEmail={currentUser?.email}
              partnerEmail={partnerEmail}
            />
          </div>
        </div>

        {/* Week strip */}
        <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} logsMap={logsMap} />

        {/* Progress */}
        {isLoading ? (
          <Skeleton className="h-48 rounded-3xl" />
        ) : (
          <DailyProgress
            totalPoints={totalPoints}
            earnedPoints={earnedPoints}
            completedCount={completedIds.size}
            totalCount={activeHabits.length}
          />
        )}

        {/* Habits list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Heute's Habits
            </h2>
            <span className="text-xs text-muted-foreground">{completedIds.size} / {activeHabits.length}</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : activeHabits.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Keine Habits</p>
              <p className="text-sm text-muted-foreground mt-1">Erstelle deinen ersten Habit</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {activeHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={completedIds.has(habit.id)}
                    onToggle={(h) => toggleMutation.mutate(h)}
                    onDelete={(h) => deleteMutation.mutate(h)}
                    showDelete={true}
                    currentUser={currentUser}
                    partnerEmail={partnerEmail}
                    selectedDate={selectedDate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
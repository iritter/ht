import React, { useMemo, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PartnerStatsPanel from '@/components/habits/PartnerStatsPanel';
import { getPartnerEmail } from '@/components/habits/PartnerSettings';
import { format, subDays, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Flame, Target, TrendingUp, Star, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary font-bold">{payload[0].value} Punkte</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const [currentUser, setCurrentUser] = useState(null);
  const partnerEmail = getPartnerEmail();
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list(),
  });

  const { data: allLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['habitLogs'],
    queryFn: () => base44.entities.HabitLog.list('-created_date', 1000),
  });

  const isLoading = habitsLoading || logsLoading;

  const habitMap = useMemo(() => {
    const m = {};
    habits.forEach(h => m[h.id] = h);
    return m;
  }, [habits]);

  const completedLogs = useMemo(() => allLogs.filter(l => l.completed), [allLogs]);

  // Points per date
  const pointsByDate = useMemo(() => {
    const m = {};
    completedLogs.forEach(log => {
      const habit = habitMap[log.habit_id];
      if (!habit) return;
      m[log.date] = (m[log.date] || 0) + (habit.points || 10);
    });
    return m;
  }, [completedLogs, habitMap]);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayScore = pointsByDate[todayStr] || 0;
  const totalScore = Object.values(pointsByDate).reduce((a, b) => a + b, 0);
  const totalDaysActive = Object.keys(pointsByDate).length;

  // Best day
  const bestDay = useMemo(() => {
    let best = { date: null, points: 0 };
    Object.entries(pointsByDate).forEach(([date, points]) => {
      if (points > best.points) best = { date, points };
    });
    return best;
  }, [pointsByDate]);

  // Last 14 days chart data
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 13), end: today });
    return days.map(day => ({
      label: format(day, 'EEE', { locale: de }),
      date: format(day, 'yyyy-MM-dd'),
      points: pointsByDate[format(day, 'yyyy-MM-dd')] || 0,
    }));
  }, [pointsByDate]);

  const maxPoints = useMemo(() => Math.max(...chartData.map(d => d.points), 1), [chartData]);

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    let d = new Date();
    while (true) {
      const str = format(d, 'yyyy-MM-dd');
      if (pointsByDate[str]) {
        count++;
        d = subDays(d, 1);
      } else {
        break;
      }
    }
    return count;
  }, [pointsByDate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/Dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Statistiken</h1>
            <p className="text-sm text-muted-foreground">Dein Fortschritt im Überblick</p>
          </div>
        </div>

        {/* Today vs Total */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary text-primary-foreground rounded-2xl p-5 col-span-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">Heute</p>
                <p className="text-4xl font-extrabold mt-1">{todayScore}</p>
                <p className="text-sm opacity-80 mt-0.5">Punkte heute</p>
              </div>
              <Star className="w-12 h-12 opacity-20" />
            </div>

            <div className="bg-card border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gesamt</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{totalScore}</p>
              <p className="text-xs text-muted-foreground mt-0.5">alle Punkte</p>
            </div>

            <div className="bg-card border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Streak</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{streak}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tage in Folge</p>
            </div>
          </div>
        )}

        {/* More stats */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Calendar} label="Aktive Tage" value={totalDaysActive} sub="Tage mit Aktivität" color="text-blue-500" />
            <StatCard
              icon={Trophy}
              label="Bester Tag"
              value={bestDay.points}
              sub={bestDay.date ? format(new Date(bestDay.date), 'dd. MMM', { locale: de }) : '–'}
              color="text-amber-500"
            />
            <StatCard icon={Target} label="Habits" value={habits.filter(h => h.is_active !== false).length} sub="aktiv" color="text-emerald-500" />
            <StatCard
              icon={TrendingUp}
              label="Ø pro Tag"
              value={totalDaysActive > 0 ? Math.round(totalScore / totalDaysActive) : 0}
              sub="Punkte Ø"
              color="text-rose-500"
            />
          </div>
        )}

        {/* Partner comparison */}
        {!isLoading && (
          <PartnerStatsPanel
            allLogs={allLogs}
            habits={habits}
            currentUser={currentUser}
            partnerEmail={partnerEmail}
          />
        )}

        {/* Chart */}
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-accent" />
            Letzte 14 Tage
          </h2>
          {isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={16}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={entry.date === todayStr ? 'hsl(var(--primary))' : entry.points > 0 ? 'hsl(var(--primary) / 0.35)' : 'hsl(var(--muted))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
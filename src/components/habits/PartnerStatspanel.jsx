import React, { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Flame, Star } from 'lucide-react';

function calcStats(logs, habitMap) {
  const pointsByDate = {};
  logs.filter(l => l.completed).forEach(log => {
    const habit = habitMap[log.habit_id];
    if (!habit) return;
    pointsByDate[log.date] = (pointsByDate[log.date] || 0) + (habit.points || 10);
  });
  const total = Object.values(pointsByDate).reduce((a, b) => a + b, 0);
  let streak = 0;
  let d = new Date();
  while (pointsByDate[format(d, 'yyyy-MM-dd')]) { streak++; d = subDays(d, 1); }
  return { pointsByDate, total, streak };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold">{label}</p>
        <p className="text-primary font-bold">{payload[0].value} Pkt</p>
        {payload[1] && <p className="text-accent font-bold">{payload[1].value} Pkt</p>}
      </div>
    );
  }
  return null;
};

export default function PartnerStatsPanel({ allLogs, habits, currentUser, partnerEmail }) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const habitMap = useMemo(() => {
    const m = {};
    habits.forEach(h => (m[h.id] = h));
    return m;
  }, [habits]);

  const myLogs = useMemo(() => allLogs.filter(l => l.created_by === currentUser?.email), [allLogs, currentUser]);
  const partnerLogs = useMemo(() => allLogs.filter(l => l.created_by === partnerEmail), [allLogs, partnerEmail]);

  const myStats = useMemo(() => calcStats(myLogs, habitMap), [myLogs, habitMap]);
  const partnerStats = useMemo(() => calcStats(partnerLogs, habitMap), [partnerLogs, habitMap]);

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    return days.map(day => {
      const d = format(day, 'yyyy-MM-dd');
      return {
        label: format(day, 'EEE', { locale: de }),
        me: myStats.pointsByDate[d] || 0,
        partner: partnerStats.pointsByDate[d] || 0,
      };
    });
  }, [myStats, partnerStats]);

  const myName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Du';
  const partnerName = partnerEmail ? partnerEmail.split('@')[0] : 'Partner';

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Trophy className="w-4 h-4 text-amber-500" />
        Vergleich mit Partner
      </h2>

      {!partnerEmail ? (
        <p className="text-sm text-muted-foreground text-center py-4">Kein Partner verbunden</p>
      ) : (
        <>
          {/* Score comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <Star className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-2xl font-extrabold text-primary">{myStats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">{myName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">🔥 {myStats.streak} Tage Streak</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 text-center">
              <Star className="w-4 h-4 mx-auto text-accent mb-1" />
              <p className="text-2xl font-extrabold text-accent">{partnerStats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">{partnerName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">🔥 {partnerStats.streak} Tage Streak</p>
            </div>
          </div>

          {/* 7-day chart */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Letzte 7 Tage</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} barSize={12} barGap={2}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="me" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} />
                <Bar dataKey="partner" radius={[4, 4, 0, 0]} fill="hsl(var(--accent))" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-85" />{myName}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm bg-accent opacity-85" />{partnerName}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
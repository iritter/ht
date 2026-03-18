import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { HABIT_COLORS } from './HabitColors';
import { IconPicker } from './HabitIcon';
import { cn } from "@/lib/utils";

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function AddHabitDialog({ onAdd, trigger, currentUserEmail, partnerEmail }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [points, setPoints] = useState(10);
  const [color, setColor] = useState('violet');
  const [icon, setIcon] = useState('Star');
  const [frequency, setFrequency] = useState('daily');
  const [frequencyDays, setFrequencyDays] = useState(2);
  const [frequencyWeekdays, setFrequencyWeekdays] = useState([0, 1, 2, 3, 4]);
  const [rotationOwner, setRotationOwner] = useState('');
  const [rotationDays, setRotationDays] = useState(0);

  const toggleWeekday = (i) => {
    setFrequencyWeekdays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd({
      name: name.trim(), points, color, icon, is_active: true,
      frequency,
      frequency_days: frequency === 'custom' ? frequencyDays : 1,
      frequency_weekdays: frequency === 'weekly' ? frequencyWeekdays : [],
      rotation_owner: rotationOwner || currentUserEmail || '',
      rotation_days: rotationDays,
    });
    setName(''); setPoints(10); setColor('violet'); setIcon('Star');
    setFrequency('daily'); setFrequencyDays(2); setFrequencyWeekdays([0, 1, 2, 3, 4]);
    setRotationOwner(''); setRotationDays(0);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Neuer Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Habit erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Morgenmeditation"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Punkte pro Abschluss</Label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25].map((p) => (
                <button key={p} type="button" onClick={() => setPoints(p)}
                  className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                    points === p ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>Wiederholung</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: 'Täglich' },
                { value: 'weekly', label: 'Wochentage' },
                { value: 'custom', label: 'Alle X Tage' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setFrequency(opt.value)}
                  className={cn("py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                    frequency === opt.value ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>

            {frequency === 'weekly' && (
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map((day, i) => (
                  <button key={i} type="button" onClick={() => toggleWeekday(i)}
                    className={cn("w-10 h-10 rounded-lg text-sm font-semibold transition-all",
                      frequencyWeekdays.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}>
                    {day}
                  </button>
                ))}
              </div>
            )}

            {frequency === 'custom' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Alle</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFrequencyDays(d => Math.max(2, d - 1))}
                    className="w-8 h-8 rounded-lg bg-secondary font-bold text-lg flex items-center justify-center hover:bg-secondary/80">−</button>
                  <span className="w-8 text-center font-bold text-lg">{frequencyDays}</span>
                  <button type="button" onClick={() => setFrequencyDays(d => Math.min(30, d + 1))}
                    className="w-8 h-8 rounded-lg bg-secondary font-bold text-lg flex items-center justify-center hover:bg-secondary/80">+</button>
                </div>
                <span className="text-sm text-muted-foreground">Tage</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button key={c.name} type="button" onClick={() => setColor(c.name)}
                  className={cn(`w-9 h-9 rounded-full bg-${c.name}-500 transition-all`,
                    color === c.name ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                  )} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          {/* Rotation */}
          <div className="space-y-3">
            <Label>Verantwortung</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: currentUserEmail, label: 'Ich' },
                { email: partnerEmail, label: 'Partner' },
              ].filter(o => o.email).map(opt => (
                <button key={opt.email} type="button" onClick={() => setRotationOwner(opt.email)}
                  className={cn("py-2 rounded-lg text-sm font-semibold transition-all",
                    rotationOwner === opt.email ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
            {rotationOwner && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Wechsel alle</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRotationDays(d => Math.max(0, d - 1))}
                    className="w-8 h-8 rounded-lg bg-secondary font-bold text-lg flex items-center justify-center hover:bg-secondary/80">−</button>
                  <span className="w-8 text-center font-bold text-lg">{rotationDays}</span>
                  <button type="button" onClick={() => setRotationDays(d => Math.min(30, d + 1))}
                    className="w-8 h-8 rounded-lg bg-secondary font-bold text-lg flex items-center justify-center hover:bg-secondary/80">+</button>
                </div>
                <span className="text-sm text-muted-foreground">Tage {rotationDays === 0 ? '(kein Wechsel)' : ''}</span>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={!name.trim()}>
            Habit erstellen
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
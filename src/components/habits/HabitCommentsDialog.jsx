import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HabitCommentsDialog({ habit, currentUser, onClose }) {
  const [input, setInput] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', habit.id],
    queryFn: () => base44.entities.HabitComment.list('-created_date', 100, { habit_id: habit.id }),
  });

  const addMutation = useMutation({
    mutationFn: (text) => base44.entities.HabitComment.create({ habit_id: habit.id, text }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['comments', habit.id] }); setInput(''); },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMutation.mutate(input.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 space-y-4 max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{habit.name} – Kommentare</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Noch keine Kommentare.</p>}
          {[...comments].reverse().map(c => (
            <div key={c.id} className="bg-secondary rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground font-medium">{c.created_by?.split('@')[0]} · {c.created_date ? format(new Date(c.created_date), 'dd.MM HH:mm') : ''}</p>
              <p className="text-sm text-foreground">{c.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Kommentar schreiben..." className="flex-1 rounded-xl" />
          <Button type="submit" size="icon" className="rounded-xl" disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
        </form>
      </div>
    </div>
  );
}
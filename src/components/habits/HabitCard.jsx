import React, { useState } from 'react';
import { Check, Trash2, MessageCircle, User } from 'lucide-react';
import HabitIcon from './HabitIcon';
import { getColorClasses } from './HabitColors';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { differenceInDays, parseISO, format } from 'date-fns';
import HabitCommentsDialog from './HabitCommentsDialog';

function getCurrentOwner(habit, selectedDate) {
  if (!habit.rotation_owner || !habit.rotation_days || habit.rotation_days <= 0) {
    return habit.rotation_owner || null;
  }
  const refDate = parseISO(habit.created_date ? habit.created_date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'));
  const diff = differenceInDays(selectedDate, refDate);
  const cycle = Math.floor(diff / habit.rotation_days) % 2;
  // cycle 0 = rotation_owner, cycle 1 = the other person
  return cycle === 0 ? habit.rotation_owner : '__partner__';
}

export default function HabitCard({ habit, isCompleted, onToggle, onDelete, showDelete, currentUser, partnerEmail, selectedDate }) {
  const colors = getColorClasses(habit.color || 'violet');
  const [showComments, setShowComments] = useState(false);

  const owner = getCurrentOwner(habit, selectedDate || new Date());
  const ownerLabel = owner === '__partner__'
    ? (partnerEmail?.split('@')[0] || 'Partner')
    : owner
      ? (owner === currentUser?.email ? 'Du' : owner.split('@')[0])
      : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer",
          isCompleted
            ? `${colors.bg} ${colors.border} border`
            : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
        )}
        onClick={() => onToggle(habit)}
      >
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          isCompleted ? `${colors.solid} text-white shadow-lg` : `${colors.bg} ${colors.text}`
        )}>
          {isCompleted ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <Check className="w-6 h-6" />
            </motion.div>
          ) : (
            <HabitIcon name={habit.icon} className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn("font-semibold text-sm transition-all", isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className={cn("text-xs font-medium", isCompleted ? colors.text : "text-muted-foreground")}>
              +{habit.points || 10} pts
            </p>
            {ownerLabel && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                <User className="w-2.5 h-2.5" />{ownerLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(habit); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {showComments && (
        <HabitCommentsDialog
          habit={habit}
          currentUser={currentUser}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
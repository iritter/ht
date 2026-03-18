import React from 'react';
import {
  Dumbbell, BookOpen, Droplets, Moon, Brain,
  Heart, Apple, Pencil, Music, Star,
  Flame, Footprints, Leaf, Sun, Coffee
} from 'lucide-react';

const iconMap = {
  Dumbbell, BookOpen, Droplets, Moon, Brain,
  Heart, Apple, Pencil, Music, Star,
  Flame, Footprints, Leaf, Sun, Coffee,
};

export default function HabitIcon({ name, className }) {
  const Icon = iconMap[name] || Star;
  return <Icon className={className} />;
}

export function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(iconMap).map(([iconName, Icon]) => (
        <button
          key={iconName}
          type="button"
          onClick={() => onChange(iconName)}
          className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
            value === iconName
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}
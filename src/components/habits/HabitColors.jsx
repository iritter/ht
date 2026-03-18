export const HABIT_COLORS = [
  { name: 'violet', label: 'Violet' },
  { name: 'blue', label: 'Blue' },
  { name: 'emerald', label: 'Green' },
  { name: 'amber', label: 'Amber' },
  { name: 'rose', label: 'Rose' },
  { name: 'cyan', label: 'Cyan' },
  { name: 'pink', label: 'Pink' },
  { name: 'orange', label: 'Orange' },
];

export const HABIT_ICONS = [
  'Dumbbell', 'BookOpen', 'Droplets', 'Moon', 'Brain',
  'Heart', 'Apple', 'Pencil', 'Music', 'Star',
  'Flame', 'Footprints', 'Leaf', 'Sun', 'Coffee'
];

export function getColorClasses(color) {
  return {
    bg: `bg-${color}-500/15`,
    text: `text-${color}-600`,
    border: `border-${color}-500/30`,
    solid: `bg-${color}-500`,
  };
}
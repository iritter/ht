import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

const STORAGE_KEY = 'habit_partner_email';

export function getPartnerEmail() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export default function PartnerSettings({ onSave }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(getPartnerEmail);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, email.trim());
    onSave?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Users className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Partner verbinden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">Gib die E-Mail-Adresse deines Partners ein, um seine Stats zu sehen.</p>
          <div className="space-y-2">
            <Label>Partner E-Mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
            />
          </div>
          <Button onClick={handleSave} className="w-full">Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
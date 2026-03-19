import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserProfileSettings({ onSave }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setName(me?.full_name || '');
      setEmail(me?.email || '');
    }).catch(() => {});

    if (!base44.auth.hasCustomLocalUser?.()) {
      setOpen(true);
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const user = await base44.auth.setLocalUser({ full_name: name, email });
      onSave?.(user);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl" title="Profil">
          <User className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Dein Profil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Lege deinen Namen und deine E-Mail fest. Diese Daten bleiben lokal auf diesem Gerät gespeichert.
          </p>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Ritti" />
          </div>
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@example.com" />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={saving || !name.trim() || !email.trim()}>
            {saving ? 'Speichern…' : 'Speichern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

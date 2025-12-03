import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickEditEmergencyProps {
  petId: string;
  type: 'emergency';
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  onUpdate: () => void;
}

interface QuickEditVetProps {
  petId: string;
  type: 'vet';
  vetName: string | null;
  vetPhone: string | null;
  vetEmail: string | null;
  onUpdate: () => void;
}

type QuickEditContactsProps = QuickEditEmergencyProps | QuickEditVetProps;

const QuickEditContacts = (props: QuickEditContactsProps) => {
  const { petId, type, onUpdate } = props;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [emergencyName, setEmergencyName] = useState(
    type === 'emergency' ? (props as QuickEditEmergencyProps).emergencyContactName || '' : ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    type === 'emergency' ? (props as QuickEditEmergencyProps).emergencyContactPhone || '' : ''
  );
  const [vetName, setVetName] = useState(
    type === 'vet' ? (props as QuickEditVetProps).vetName || '' : ''
  );
  const [vetPhone, setVetPhone] = useState(
    type === 'vet' ? (props as QuickEditVetProps).vetPhone || '' : ''
  );
  const [vetEmail, setVetEmail] = useState(
    type === 'vet' ? (props as QuickEditVetProps).vetEmail || '' : ''
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = type === 'emergency' 
        ? {
            emergency_contact_name: emergencyName || null,
            emergency_contact_phone: emergencyPhone || null,
          }
        : {
            vet_name: vetName || null,
            vet_phone: vetPhone || null,
            vet_email: vetEmail || null,
          };

      const { error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', petId);

      if (error) throw error;

      toast({ title: `${type === 'emergency' ? 'Emergency contact' : 'Veterinarian'} updated!` });
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {type === 'emergency' ? 'Emergency Contact' : 'Veterinarian'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {type === 'emergency' ? (
            <>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Vet Name / Clinic</Label>
                <Input
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="Dr. Smith / ABC Vet Clinic"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={vetPhone}
                  onChange={(e) => setVetPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={vetEmail}
                  onChange={(e) => setVetEmail(e.target.value)}
                  placeholder="vet@clinic.com"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEditContacts;

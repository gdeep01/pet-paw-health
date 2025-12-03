import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AddVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName: string;
  onSuccess: () => void;
}

const COMMON_VACCINES = [
  'Rabies',
  'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)',
  'Bordetella (Kennel Cough)',
  'Leptospirosis',
  'Lyme Disease',
  'Canine Influenza',
  'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
  'FeLV (Feline Leukemia)',
];

const AddVaccinationDialog = ({ open, onOpenChange, petId, petName, onSuccess }: AddVaccinationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    date_given: '',
    next_due_date: '',
    vet_name: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!user || !formData.vaccine_name || !formData.date_given) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('vaccinations').insert({
        pet_id: petId,
        user_id: user.id,
        vaccine_name: formData.vaccine_name,
        date_given: formData.date_given,
        next_due_date: formData.next_due_date || null,
        vet_name: formData.vet_name || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({ title: 'Vaccination added!', description: `${formData.vaccine_name} recorded for ${petName}` });
      setFormData({ vaccine_name: '', date_given: '', next_due_date: '', vet_name: '', notes: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vaccination for {petName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Vaccine Name *</Label>
            <Input
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              placeholder="e.g., Rabies"
              list="vaccine-suggestions"
            />
            <datalist id="vaccine-suggestions">
              {COMMON_VACCINES.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Given *</Label>
              <Input
                type="date"
                value={formData.date_given}
                onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Input
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Administered By</Label>
            <Input
              value={formData.vet_name}
              onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
              placeholder="Vet name or clinic"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Add Vaccination'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVaccinationDialog;

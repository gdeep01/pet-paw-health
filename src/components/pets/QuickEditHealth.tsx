import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickEditHealthProps {
  petId: string;
  knownAllergies: string | null;
  chronicConditions: string | null;
  bloodGroup: string | null;
  weightKg: number | null;
  onUpdate: () => void;
}

const QuickEditHealth = ({ petId, knownAllergies, chronicConditions, bloodGroup, weightKg, onUpdate }: QuickEditHealthProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    known_allergies: knownAllergies || '',
    chronic_conditions: chronicConditions || '',
    blood_group: bloodGroup || '',
    weight_kg: weightKg?.toString() || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pets')
        .update({
          known_allergies: formData.known_allergies || null,
          chronic_conditions: formData.chronic_conditions || null,
          blood_group: formData.blood_group || null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        })
        .eq('id', petId);

      if (error) throw error;

      toast({ title: 'Health info updated!' });
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
          <DialogTitle>Edit Health Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                placeholder="e.g., 12.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Input
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                placeholder="e.g., DEA 1.1+"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Known Allergies</Label>
            <Textarea
              value={formData.known_allergies}
              onChange={(e) => setFormData({ ...formData, known_allergies: e.target.value })}
              placeholder="List any known allergies..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Chronic Conditions</Label>
            <Textarea
              value={formData.chronic_conditions}
              onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
              placeholder="List any chronic conditions..."
              rows={2}
            />
          </div>
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

export default QuickEditHealth;

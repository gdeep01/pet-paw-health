import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Syringe, Plus, Calendar, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import AddVaccinationDialog from './AddVaccinationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Vaccination {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string | null;
  vet_name: string | null;
  notes: string | null;
}

interface VaccinationListProps {
  petId: string;
  petName: string;
  onVaccinationChange?: () => void;
}

const VaccinationList = ({ petId, petName, onVaccinationChange }: VaccinationListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVaccinations();
    }
  }, [petId, user]);

  const fetchVaccinations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', petId)
        .order('next_due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setVaccinations(data || []);
    } catch (error: any) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVaccination = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Vaccination record deleted' });
      fetchVaccinations();
      onVaccinationChange?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleVaccinationAdded = () => {
    fetchVaccinations();
    onVaccinationChange?.();
  };

  const getStatus = (nextDueDate: string | null) => {
    if (!nextDueDate) return { label: 'No reminder', variant: 'secondary' as const };
    
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    
    if (isPast(dueDate)) {
      return { label: 'Overdue', variant: 'destructive' as const, icon: AlertTriangle };
    }
    
    if (isWithinInterval(dueDate, { start: today, end: addDays(today, 30) })) {
      return { label: 'Due soon', variant: 'default' as const, icon: Calendar };
    }
    
    return { label: 'Up to date', variant: 'secondary' as const, icon: Check };
  };

  const upcomingVaccines = vaccinations.filter(v => {
    if (!v.next_due_date) return false;
    const dueDate = new Date(v.next_due_date);
    return isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 30) }) || isPast(dueDate);
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Syringe className="w-4 h-4 text-primary" />
            Vaccinations
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Alerts for upcoming/overdue */}
        {upcomingVaccines.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {upcomingVaccines.length} vaccination{upcomingVaccines.length > 1 ? 's' : ''} due or overdue
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : vaccinations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vaccination records yet. Add your pet's first vaccination.</p>
        ) : (
          <div className="space-y-3">
            {vaccinations.map((vax) => {
              const status = getStatus(vax.next_due_date);
              return (
                <div key={vax.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{vax.vaccine_name}</p>
                      <Badge variant={status.variant} className="text-xs">
                        {status.icon && <status.icon className="w-3 h-3 mr-1" />}
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Given: {format(new Date(vax.date_given), 'MMM d, yyyy')}
                      {vax.next_due_date && ` • Next: ${format(new Date(vax.next_due_date), 'MMM d, yyyy')}`}
                    </p>
                    {vax.vet_name && (
                      <p className="text-xs text-muted-foreground">By: {vax.vet_name}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete vaccination record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this vaccination record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteVaccination(vax.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AddVaccinationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        petId={petId}
        petName={petName}
        onSuccess={handleVaccinationAdded}
      />
    </Card>
  );
};

export default VaccinationList;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { Check, Clock, AlertTriangle, X, RefreshCw, Syringe } from 'lucide-react';
import { 
  PetVaccineSchedule,
  fetchPetVaccineSchedule, 
  completeScheduledVaccine,
  skipScheduledVaccine,
  generateVaccineSchedule
} from '@/lib/vaccineScheduleService';
import { toast } from 'sonner';

interface VaccineScheduleProps {
  petId: string;
  userId: string;
  species: string;
  dateOfBirth: string;
  onScheduleChange?: () => void;
}

const statusConfig = {
  pending: { 
    label: 'Upcoming', 
    icon: <Clock className="w-4 h-4" />, 
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
  },
  completed: { 
    label: 'Completed', 
    icon: <Check className="w-4 h-4" />, 
    color: 'bg-green-500/10 text-green-600 border-green-500/20' 
  },
  overdue: { 
    label: 'Overdue', 
    icon: <AlertTriangle className="w-4 h-4" />, 
    color: 'bg-red-500/10 text-red-600 border-red-500/20' 
  },
  skipped: { 
    label: 'Skipped', 
    icon: <X className="w-4 h-4" />, 
    color: 'bg-muted text-muted-foreground border-border' 
  },
};

const VaccineSchedule = ({ petId, userId, species, dateOfBirth, onScheduleChange }: VaccineScheduleProps) => {
  const [schedule, setSchedule] = useState<PetVaccineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSchedule = async () => {
    setLoading(true);
    const data = await fetchPetVaccineSchedule(petId);
    setSchedule(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSchedule();
  }, [petId]);

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    const result = await generateVaccineSchedule(petId, userId, species, dateOfBirth);
    if (result.success) {
      toast.success('Vaccine schedule generated based on species and age');
      loadSchedule();
      onScheduleChange?.();
    } else {
      toast.error(result.error || 'Failed to generate schedule');
    }
    setGenerating(false);
  };

  const handleComplete = async (scheduleId: string) => {
    setActionLoading(scheduleId);
    const result = await completeScheduledVaccine(scheduleId, format(new Date(), 'yyyy-MM-dd'));
    if (result.success) {
      toast.success('Vaccine marked as completed');
      loadSchedule();
      onScheduleChange?.();
    } else {
      toast.error('Failed to update vaccine status');
    }
    setActionLoading(null);
  };

  const handleSkip = async (scheduleId: string) => {
    setActionLoading(scheduleId);
    const result = await skipScheduledVaccine(scheduleId, 'Skipped by owner');
    if (result.success) {
      toast.success('Vaccine skipped');
      loadSchedule();
      onScheduleChange?.();
    } else {
      toast.error('Failed to skip vaccine');
    }
    setActionLoading(null);
  };

  const getDueDateLabel = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'skipped') return null;
    
    const date = new Date(dueDate);
    const days = differenceInDays(date, new Date());
    
    if (isToday(date)) return 'Due today';
    if (isPast(date)) return `${Math.abs(days)} days overdue`;
    if (days <= 7) return `Due in ${days} days`;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading vaccine schedule...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Syringe className="w-5 h-5" />
          Vaccine Schedule
        </CardTitle>
        {schedule.length === 0 && (
          <Button size="sm" onClick={handleGenerateSchedule} disabled={generating}>
            <RefreshCw className={`w-4 h-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
            Generate Schedule
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {schedule.length === 0 ? (
          <div className="text-center py-8">
            <Syringe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">
              No vaccine schedule yet. Generate one based on your pet's species and age.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {schedule.map((item) => {
                const config = statusConfig[item.status];
                const dueDateLabel = getDueDateLabel(item.due_date, item.status);
                const isActionable = item.status === 'pending' || item.status === 'overdue';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${config.color}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {config.icon}
                            {config.label}
                          </Badge>
                          {dueDateLabel && (
                            <span className={`text-xs ${item.status === 'overdue' ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                              {dueDateLabel}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium truncate">{item.vaccine_name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.status === 'completed' && item.completed_date
                            ? `Completed: ${format(new Date(item.completed_date), 'MMM d, yyyy')}`
                            : `Due: ${format(new Date(item.due_date), 'MMM d, yyyy')}`}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>
                        )}
                      </div>
                      
                      {isActionable && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            onClick={() => handleComplete(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => handleSkip(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default VaccineSchedule;
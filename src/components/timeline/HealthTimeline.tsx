import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Plus, Syringe, Stethoscope, AlertCircle, FileText, Scale, Pill, Trash2 } from 'lucide-react';
import { 
  HealthTimelineEvent, 
  TimelineEventType,
  fetchPetTimeline, 
  deleteTimelineEvent,
  getEventTypeInfo 
} from '@/lib/healthTimelineService';
import AddTimelineEventDialog from './AddTimelineEventDialog';
import { toast } from 'sonner';

interface HealthTimelineProps {
  petId: string;
  userId: string;
  onEventChange?: () => void;
}

const eventIcons: Record<TimelineEventType, React.ReactNode> = {
  vaccination: <Syringe className="w-4 h-4" />,
  vet_visit: <Stethoscope className="w-4 h-4" />,
  symptom: <AlertCircle className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  weight_update: <Scale className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
};

const eventColors: Record<TimelineEventType, string> = {
  vaccination: 'bg-green-500/10 text-green-600 border-green-500/20',
  vet_visit: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  symptom: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  note: 'bg-muted text-muted-foreground border-border',
  weight_update: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  medication: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

const HealthTimeline = ({ petId, userId, onEventChange }: HealthTimelineProps) => {
  const [events, setEvents] = useState<HealthTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadTimeline = async () => {
    setLoading(true);
    const data = await fetchPetTimeline(petId);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTimeline();
  }, [petId]);

  const handleDelete = async (eventId: string) => {
    setDeleting(eventId);
    const result = await deleteTimelineEvent(eventId);
    if (result.success) {
      toast.success('Event deleted');
      loadTimeline();
      onEventChange?.();
    } else {
      toast.error('Failed to delete event');
    }
    setDeleting(null);
  };

  const handleEventAdded = () => {
    loadTimeline();
    onEventChange?.();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading timeline...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Health Timeline</CardTitle>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No health events recorded yet. Add your first event to start tracking.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {events.map((event) => {
                  const typeInfo = getEventTypeInfo(event.event_type);
                  return (
                    <div key={event.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${eventColors[event.event_type]}`}>
                        {eventIcons[event.event_type]}
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${eventColors[event.event_type]}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {typeInfo.label}
                              </Badge>
                              {event.severity && (
                                <Badge 
                                  variant={event.severity === 'severe' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {event.severity}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(event.event_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(event.id)}
                            disabled={deleting === event.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <AddTimelineEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        petId={petId}
        userId={userId}
        onEventAdded={handleEventAdded}
      />
    </Card>
  );
};

export default HealthTimeline;
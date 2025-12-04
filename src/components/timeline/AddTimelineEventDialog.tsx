import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { addTimelineEvent, TimelineEventType } from '@/lib/healthTimelineService';
import { toast } from 'sonner';

interface AddTimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  userId: string;
  onEventAdded: () => void;
}

const eventTypes: { value: TimelineEventType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'symptom', label: 'Symptom' },
  { value: 'medication', label: 'Medication' },
  { value: 'weight_update', label: 'Weight Update' },
  { value: 'note', label: 'Note' },
];

const severityOptions = ['mild', 'moderate', 'severe'];

const AddTimelineEventDialog = ({
  open,
  onOpenChange,
  petId,
  userId,
  onEventAdded,
}: AddTimelineEventDialogProps) => {
  const [eventType, setEventType] = useState<TimelineEventType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEventType('note');
    setTitle('');
    setDescription('');
    setEventDate(format(new Date(), 'yyyy-MM-dd'));
    setSeverity('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    const result = await addTimelineEvent({
      pet_id: petId,
      user_id: userId,
      event_type: eventType,
      event_date: eventDate,
      title: title.trim(),
      description: description.trim() || undefined,
      severity: eventType === 'symptom' && severity ? severity : undefined,
    });

    setLoading(false);

    if (result.success) {
      toast.success('Event added to timeline');
      resetForm();
      onOpenChange(false);
      onEventAdded();
    } else {
      toast.error(result.error || 'Failed to add event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as TimelineEventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual checkup, Rabies vaccine"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {eventType === 'symptom' && (
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimelineEventDialog;
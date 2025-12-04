import { supabase } from '@/integrations/supabase/client';

export type TimelineEventType = 'vaccination' | 'vet_visit' | 'symptom' | 'note' | 'weight_update' | 'medication';

export interface HealthTimelineEvent {
  id: string;
  pet_id: string;
  user_id: string;
  event_type: TimelineEventType;
  event_date: string;
  title: string;
  description: string | null;
  severity: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTimelineEvent {
  pet_id: string;
  user_id: string;
  event_type: TimelineEventType;
  event_date: string;
  title: string;
  description?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch all timeline events for a pet
 */
export async function fetchPetTimeline(petId: string): Promise<HealthTimelineEvent[]> {
  const { data, error } = await supabase
    .from('health_timeline')
    .select('*')
    .eq('pet_id', petId)
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }

  return (data || []) as HealthTimelineEvent[];
}

/**
 * Add a new timeline event
 */
export async function addTimelineEvent(event: CreateTimelineEvent): Promise<{ success: boolean; error?: string; data?: HealthTimelineEvent }> {
  const { data, error } = await supabase
    .from('health_timeline')
    .insert([{
      pet_id: event.pet_id,
      user_id: event.user_id,
      event_type: event.event_type,
      event_date: event.event_date,
      title: event.title,
      description: event.description || null,
      severity: event.severity || null,
      metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding timeline event:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as HealthTimelineEvent };
}

/**
 * Update a timeline event
 */
export async function updateTimelineEvent(
  eventId: string,
  updates: Partial<Pick<CreateTimelineEvent, 'event_date' | 'title' | 'description' | 'severity'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('health_timeline')
    .update(updates)
    .eq('id', eventId);

  if (error) {
    console.error('Error updating timeline event:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('health_timeline')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting timeline event:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Add vaccination to timeline (helper for when a vaccination is recorded)
 */
export async function addVaccinationToTimeline(
  petId: string,
  userId: string,
  vaccineName: string,
  dateGiven: string,
  vetName?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  return addTimelineEvent({
    pet_id: petId,
    user_id: userId,
    event_type: 'vaccination',
    event_date: dateGiven,
    title: `${vaccineName} Vaccination`,
    description: notes,
    metadata: { vet_name: vetName },
  });
}

/**
 * Get timeline events for emergency profile (limited data)
 */
export async function fetchEmergencyTimeline(petId: string): Promise<HealthTimelineEvent[]> {
  const { data, error } = await supabase
    .from('health_timeline')
    .select('id, event_type, event_date, title, severity')
    .eq('pet_id', petId)
    .order('event_date', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching emergency timeline:', error);
    return [];
  }

  return (data || []) as HealthTimelineEvent[];
}

/**
 * Get event type display info
 */
export function getEventTypeInfo(eventType: TimelineEventType): { label: string; color: string; icon: string } {
  const typeInfo: Record<TimelineEventType, { label: string; color: string; icon: string }> = {
    vaccination: { label: 'Vaccination', color: 'bg-green-500', icon: '💉' },
    vet_visit: { label: 'Vet Visit', color: 'bg-blue-500', icon: '🏥' },
    symptom: { label: 'Symptom', color: 'bg-orange-500', icon: '🤒' },
    note: { label: 'Note', color: 'bg-gray-500', icon: '📝' },
    weight_update: { label: 'Weight Update', color: 'bg-purple-500', icon: '⚖️' },
    medication: { label: 'Medication', color: 'bg-pink-500', icon: '💊' },
  };

  return typeInfo[eventType] || { label: 'Event', color: 'bg-gray-500', icon: '📋' };
}
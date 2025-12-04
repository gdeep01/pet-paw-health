import { supabase } from '@/integrations/supabase/client';
import { differenceInWeeks, addWeeks, addMonths, format } from 'date-fns';

export interface VaccineProtocol {
  id: string;
  species: string;
  vaccine_name: string;
  is_core: boolean;
  min_age_weeks: number;
  max_age_weeks: number | null;
  dose_number: number;
  interval_weeks: number | null;
  booster_interval_months: number | null;
  description: string | null;
}

export interface PetVaccineSchedule {
  id: string;
  pet_id: string;
  user_id: string;
  protocol_id: string | null;
  vaccine_name: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'skipped';
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all vaccine protocols for a given species
 */
export async function fetchVaccineProtocols(species: string): Promise<VaccineProtocol[]> {
  const normalizedSpecies = species.toLowerCase();
  const { data, error } = await supabase
    .from('vaccine_protocols')
    .select('*')
    .eq('species', normalizedSpecies)
    .order('min_age_weeks', { ascending: true });

  if (error) {
    console.error('Error fetching vaccine protocols:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate vaccine schedule for a pet based on species and DOB
 */
export async function generateVaccineSchedule(
  petId: string,
  userId: string,
  species: string,
  dateOfBirth: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const protocols = await fetchVaccineProtocols(species);
    if (protocols.length === 0) {
      return { success: false, error: 'No vaccine protocols found for this species' };
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    const petAgeWeeks = differenceInWeeks(today, dob);

    // Filter protocols applicable to this pet's age
    const applicableProtocols = protocols.filter(protocol => {
      // For puppies/kittens, use initial series
      // For adults, use booster protocols
      if (petAgeWeeks < 52) {
        // Young pet - use puppy/kitten protocols
        return protocol.min_age_weeks < 52;
      } else {
        // Adult pet - use adult booster protocols
        return protocol.min_age_weeks >= 52 || protocol.booster_interval_months !== null;
      }
    });

    const scheduleItems: Array<{
      pet_id: string;
      user_id: string;
      protocol_id: string;
      vaccine_name: string;
      due_date: string;
      status: string;
    }> = [];

    for (const protocol of applicableProtocols) {
      let dueDate: Date;

      if (petAgeWeeks < protocol.min_age_weeks) {
        // Pet hasn't reached minimum age yet - schedule for when they do
        dueDate = addWeeks(dob, protocol.min_age_weeks);
      } else if (protocol.max_age_weeks && petAgeWeeks > protocol.max_age_weeks) {
        // Pet is too old for this specific dose, skip
        continue;
      } else if (petAgeWeeks >= 52 && protocol.booster_interval_months) {
        // Adult pet - schedule booster from today
        dueDate = addMonths(today, protocol.booster_interval_months);
      } else {
        // Pet is within age range - schedule now or soon
        dueDate = today;
      }

      scheduleItems.push({
        pet_id: petId,
        user_id: userId,
        protocol_id: protocol.id,
        vaccine_name: protocol.vaccine_name,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: 'pending',
      });
    }

    if (scheduleItems.length > 0) {
      const { error } = await supabase
        .from('pet_vaccine_schedules')
        .insert(scheduleItems);

      if (error) {
        console.error('Error inserting vaccine schedule:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error generating vaccine schedule:', error);
    return { success: false, error: 'Failed to generate vaccine schedule' };
  }
}

/**
 * Fetch pet's vaccine schedule
 */
export async function fetchPetVaccineSchedule(petId: string): Promise<PetVaccineSchedule[]> {
  const { data, error } = await supabase
    .from('pet_vaccine_schedules')
    .select('*')
    .eq('pet_id', petId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching vaccine schedule:', error);
    return [];
  }

  // Update overdue status
  const today = new Date();
  const updatedData = (data || []).map(item => {
    if (item.status === 'pending' && new Date(item.due_date) < today) {
      return { ...item, status: 'overdue' as const };
    }
    return item as PetVaccineSchedule;
  });

  return updatedData;
}

/**
 * Mark a scheduled vaccine as completed
 */
export async function completeScheduledVaccine(
  scheduleId: string,
  completedDate: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pet_vaccine_schedules')
    .update({
      status: 'completed',
      completed_date: completedDate,
      notes: notes || null,
    })
    .eq('id', scheduleId);

  if (error) {
    console.error('Error completing vaccine:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Skip a scheduled vaccine
 */
export async function skipScheduledVaccine(
  scheduleId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pet_vaccine_schedules')
    .update({
      status: 'skipped',
      notes: reason || null,
    })
    .eq('id', scheduleId);

  if (error) {
    console.error('Error skipping vaccine:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get upcoming vaccinations across all pets for a user
 */
export async function getUpcomingVaccinations(userId: string, daysAhead: number = 30): Promise<PetVaccineSchedule[]> {
  const today = new Date();
  const futureDate = addWeeks(today, Math.ceil(daysAhead / 7));

  const { data, error } = await supabase
    .from('pet_vaccine_schedules')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'overdue'])
    .lte('due_date', format(futureDate, 'yyyy-MM-dd'))
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming vaccinations:', error);
    return [];
  }

  return (data || []) as PetVaccineSchedule[];
}
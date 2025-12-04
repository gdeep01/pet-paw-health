import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a pet and all its dependent records
 * This ensures no orphan records are left behind
 */
export async function deletePetWithDependents(petId: string, userId: string): Promise<{ error: Error | null }> {
  try {
    // Delete all vaccinations for this pet
    const { error: vaccinationError } = await supabase
      .from('vaccinations')
      .delete()
      .eq('pet_id', petId)
      .eq('user_id', userId);

    if (vaccinationError) {
      console.error('Error deleting vaccinations:', vaccinationError);
    }

    // Delete all vaccine schedules for this pet
    const { error: scheduleError } = await supabase
      .from('pet_vaccine_schedules')
      .delete()
      .eq('pet_id', petId)
      .eq('user_id', userId);

    if (scheduleError) {
      console.error('Error deleting vaccine schedules:', scheduleError);
    }

    // Delete all health timeline events for this pet
    const { error: timelineError } = await supabase
      .from('health_timeline')
      .delete()
      .eq('pet_id', petId)
      .eq('user_id', userId);

    if (timelineError) {
      console.error('Error deleting timeline events:', timelineError);
    }

    // Then delete the pet
    const { error: petError } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('user_id', userId);

    if (petError) {
      throw petError;
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
/**
 * Fetch pet with its vaccinations for risk calculation
 */
export async function fetchPetWithVaccinations(petId: string, userId: string) {
  const [petResult, vaccinationsResult] = await Promise.all([
    supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('vaccinations')
      .select('*')
      .eq('pet_id', petId)
      .order('next_due_date', { ascending: true, nullsFirst: false })
  ]);

  return {
    pet: petResult.data,
    petError: petResult.error,
    vaccinations: vaccinationsResult.data || [],
    vaccinationsError: vaccinationsResult.error
  };
}

/**
 * Get last vaccination for a pet
 */
export async function getLastVaccination(petId: string) {
  const { data, error } = await supabase
    .from('vaccinations')
    .select('vaccine_name, date_given')
    .eq('pet_id', petId)
    .order('date_given', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

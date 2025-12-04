import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a pet and all its dependent records
 * This ensures no orphan records are left behind
 */
export async function deletePetWithDependents(petId: string, userId: string): Promise<{ error: Error | null }> {
  try {
    // First, delete all vaccinations for this pet
    const { error: vaccinationError } = await supabase
      .from('vaccinations')
      .delete()
      .eq('pet_id', petId)
      .eq('user_id', userId);

    if (vaccinationError) {
      console.error('Error deleting vaccinations:', vaccinationError);
      // Continue anyway - pet deletion will fail if there's a FK constraint
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

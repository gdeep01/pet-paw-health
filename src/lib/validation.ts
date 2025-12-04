import { z } from 'zod';

// Pet form validation schema
export const petFormSchema = z.object({
  pet_name: z.string()
    .trim()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be 50 characters or less'),
  species: z.enum(['Dog', 'Cat'], { 
    errorMap: () => ({ message: 'Please select a species' }) 
  }),
  breed: z.string().max(100, 'Breed must be 100 characters or less').optional(),
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      return dob <= today;
    }, 'Date of birth cannot be in the future'),
  weight_kg: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 200;
    }, 'Weight must be between 0 and 200 kg'),
  is_indoor: z.boolean().default(true),
  known_allergies: z.string().max(500, 'Allergies must be 500 characters or less').optional(),
  blood_group: z.string().max(20, 'Blood group must be 20 characters or less').optional(),
  chronic_conditions: z.string().max(500, 'Conditions must be 500 characters or less').optional(),
  vet_name: z.string().max(100, 'Vet name must be 100 characters or less').optional(),
  vet_phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
  vet_email: z.string().email('Invalid email').optional().or(z.literal('')),
  emergency_contact_name: z.string().max(100, 'Name must be 100 characters or less').optional(),
  emergency_contact_phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
});

export type PetFormData = z.infer<typeof petFormSchema>;

// Vaccination validation schema
export const vaccinationSchema = z.object({
  vaccine_name: z.string()
    .trim()
    .min(1, 'Vaccine name is required')
    .max(100, 'Vaccine name must be 100 characters or less'),
  date_given: z.string()
    .min(1, 'Date given is required')
    .refine((date) => {
      const given = new Date(date);
      const today = new Date();
      return given <= today;
    }, 'Date given cannot be in the future'),
  next_due_date: z.string().optional(),
  vet_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type VaccinationFormData = z.infer<typeof vaccinationSchema>;

// Validation helper
export function validatePetForm(data: Record<string, any>): { 
  success: boolean; 
  errors: Record<string, string>;
  data?: PetFormData;
} {
  const result = petFormSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

export function validateVaccination(data: Record<string, any>): {
  success: boolean;
  errors: Record<string, string>;
  data?: VaccinationFormData;
} {
  const result = vaccinationSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

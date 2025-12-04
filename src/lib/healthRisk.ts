import { differenceInYears, isPast, differenceInDays } from 'date-fns';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface HealthRiskResult {
  level: RiskLevel;
  score: number;
  factors: string[];
}

interface Pet {
  date_of_birth: string;
  species: string;
  known_allergies?: string | null;
  chronic_conditions?: string | null;
}

interface Vaccination {
  vaccine_name: string;
  next_due_date: string | null;
}

// Core vaccines that are critical for pet health
const CORE_VACCINES = {
  Dog: ['Rabies', 'DHPP', 'Distemper', 'Parvovirus', 'Parvo'],
  Cat: ['Rabies', 'FVRCP', 'Panleukopenia', 'Calicivirus']
};

/**
 * Calculate health risk score for a pet based on multiple factors
 * This is a rule-based engine that considers:
 * - Overdue vaccinations (core vs optional)
 * - Pet age (senior pets have higher risk)
 * - Number of chronic conditions
 * - Vaccination coverage
 */
export function calculateHealthRisk(
  pet: Pet,
  vaccinations: Vaccination[]
): HealthRiskResult {
  let score = 0;
  const factors: string[] = [];
  const today = new Date();

  // Factor 1: Check overdue vaccinations
  const overdueVaccines = vaccinations.filter(v => 
    v.next_due_date && isPast(new Date(v.next_due_date))
  );

  const speciesCore = CORE_VACCINES[pet.species as keyof typeof CORE_VACCINES] || [];

  overdueVaccines.forEach(v => {
    const isCore = speciesCore.some(core => 
      v.vaccine_name.toLowerCase().includes(core.toLowerCase())
    );
    
    if (isCore) {
      score += 3;
      factors.push(`Overdue core vaccine: ${v.vaccine_name}`);
    } else {
      score += 1;
      factors.push(`Overdue optional vaccine: ${v.vaccine_name}`);
    }
  });

  // Factor 2: Senior pet age (7+ years for dogs, 10+ for cats)
  const age = differenceInYears(today, new Date(pet.date_of_birth));
  const seniorAge = pet.species.toLowerCase() === 'cat' ? 10 : 7;
  
  if (age >= seniorAge) {
    score += 1;
    factors.push(`Senior pet (${age} years old)`);
  }

  // Factor 3: Chronic conditions
  if (pet.chronic_conditions && pet.chronic_conditions.trim().length > 0) {
    const conditionCount = pet.chronic_conditions.split(',').length;
    score += Math.min(conditionCount, 2);
    factors.push(`Has chronic conditions`);
  }

  // Factor 4: No vaccinations at all
  if (vaccinations.length === 0) {
    score += 2;
    factors.push('No vaccination records');
  }

  // Factor 5: Severely overdue (more than 60 days past due)
  const severelyOverdue = overdueVaccines.filter(v => {
    if (!v.next_due_date) return false;
    return differenceInDays(today, new Date(v.next_due_date)) > 60;
  });

  if (severelyOverdue.length > 0) {
    score += 2;
    factors.push(`${severelyOverdue.length} vaccine(s) severely overdue (60+ days)`);
  }

  // Determine risk level
  let level: RiskLevel;
  if (score === 0) {
    level = 'low';
  } else if (score <= 3) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return { level, score, factors };
}

/**
 * Get risk level styling
 */
export function getRiskLevelStyle(level: RiskLevel): {
  label: string;
  className: string;
  bgClassName: string;
} {
  switch (level) {
    case 'low':
      return {
        label: 'Low Risk',
        className: 'text-[hsl(var(--risk-low))]',
        bgClassName: 'bg-[hsl(var(--risk-low))]'
      };
    case 'medium':
      return {
        label: 'Medium Risk',
        className: 'text-[hsl(var(--warning))]',
        bgClassName: 'bg-[hsl(var(--warning))]'
      };
    case 'high':
      return {
        label: 'High Risk',
        className: 'text-destructive',
        bgClassName: 'bg-destructive'
      };
  }
}

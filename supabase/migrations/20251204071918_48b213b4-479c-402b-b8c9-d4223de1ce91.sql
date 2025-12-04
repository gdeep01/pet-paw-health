-- Create enum for timeline event types
CREATE TYPE public.timeline_event_type AS ENUM ('vaccination', 'vet_visit', 'symptom', 'note', 'weight_update', 'medication');

-- Create unified health timeline table
CREATE TABLE public.health_timeline (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    event_type timeline_event_type NOT NULL,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT, -- for symptoms: mild, moderate, severe
    metadata JSONB, -- flexible storage for type-specific data
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own pet timeline events"
ON public.health_timeline FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert timeline events for their pets"
ON public.health_timeline FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline events"
ON public.health_timeline FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline events"
ON public.health_timeline FOR DELETE
USING (auth.uid() = user_id);

-- Public access for emergency profile (read-only, limited fields)
CREATE POLICY "Anyone can view timeline for emergency profile"
ON public.health_timeline FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_health_timeline_updated_at
BEFORE UPDATE ON public.health_timeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create vaccine protocols table (species and age-based schedules)
CREATE TABLE public.vaccine_protocols (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    species TEXT NOT NULL, -- 'dog' or 'cat'
    vaccine_name TEXT NOT NULL,
    is_core BOOLEAN NOT NULL DEFAULT true,
    min_age_weeks INTEGER NOT NULL, -- minimum age to administer
    max_age_weeks INTEGER, -- null means no upper limit
    dose_number INTEGER NOT NULL DEFAULT 1, -- which dose in series
    interval_weeks INTEGER, -- weeks between doses, null for single dose
    booster_interval_months INTEGER, -- months until booster needed
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE public.vaccine_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vaccine protocols"
ON public.vaccine_protocols FOR SELECT
USING (true);

-- Insert standard dog vaccine protocols
INSERT INTO public.vaccine_protocols (species, vaccine_name, is_core, min_age_weeks, max_age_weeks, dose_number, interval_weeks, booster_interval_months, description) VALUES
-- Core Dog Vaccines - Puppy Series
('dog', 'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)', true, 6, 8, 1, 3, null, 'First puppy shot'),
('dog', 'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)', true, 9, 12, 2, 3, null, 'Second puppy shot'),
('dog', 'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)', true, 12, 16, 3, null, 12, 'Third puppy shot, then annual booster'),
('dog', 'Rabies', true, 12, 16, 1, null, 12, 'Required by law, annual or 3-year depending on vaccine'),
-- Core Dog Vaccines - Adult
('dog', 'DHPP Booster', true, 52, null, 1, null, 12, 'Annual booster for adult dogs'),
('dog', 'Rabies Booster', true, 52, null, 1, null, 36, 'Every 1-3 years for adult dogs'),
-- Non-core Dog Vaccines
('dog', 'Bordetella (Kennel Cough)', false, 8, null, 1, null, 12, 'Recommended for dogs in social settings'),
('dog', 'Leptospirosis', false, 12, null, 1, 3, 12, 'Recommended in endemic areas'),
('dog', 'Lyme Disease', false, 12, null, 1, 3, 12, 'Recommended in tick-prevalent areas'),
('dog', 'Canine Influenza', false, 8, null, 1, 3, 12, 'Recommended for dogs in boarding/daycare'),

-- Core Cat Vaccines - Kitten Series
('cat', 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', true, 6, 8, 1, 3, null, 'First kitten shot'),
('cat', 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', true, 9, 12, 2, 3, null, 'Second kitten shot'),
('cat', 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', true, 12, 16, 3, null, 12, 'Third kitten shot, then annual booster'),
('cat', 'Rabies', true, 12, 16, 1, null, 12, 'Required by law'),
-- Core Cat Vaccines - Adult
('cat', 'FVRCP Booster', true, 52, null, 1, null, 36, 'Every 1-3 years for adult cats'),
('cat', 'Rabies Booster', true, 52, null, 1, null, 12, 'Annual for adult cats'),
-- Non-core Cat Vaccines
('cat', 'FeLV (Feline Leukemia)', false, 8, null, 1, 3, 12, 'Recommended for outdoor cats'),
('cat', 'FIV (Feline Immunodeficiency Virus)', false, 8, null, 1, 3, 12, 'For high-risk cats');

-- Create pet vaccine schedule table (auto-generated schedules per pet)
CREATE TABLE public.pet_vaccine_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    protocol_id UUID REFERENCES public.vaccine_protocols(id),
    vaccine_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, overdue, skipped
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_vaccine_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pet vaccine schedules"
ON public.pet_vaccine_schedules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert vaccine schedules for their pets"
ON public.pet_vaccine_schedules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pet vaccine schedules"
ON public.pet_vaccine_schedules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their pet vaccine schedules"
ON public.pet_vaccine_schedules FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_pet_vaccine_schedules_updated_at
BEFORE UPDATE ON public.pet_vaccine_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
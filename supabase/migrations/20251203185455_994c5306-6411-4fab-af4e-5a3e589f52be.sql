-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vaccine_name TEXT NOT NULL,
  date_given DATE NOT NULL,
  next_due_date DATE,
  vet_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pet vaccinations" 
ON public.vaccinations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert vaccinations for their pets" 
ON public.vaccinations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations" 
ON public.vaccinations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations" 
ON public.vaccinations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_vaccinations_updated_at
BEFORE UPDATE ON public.vaccinations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_vaccinations_pet_id ON public.vaccinations(pet_id);
CREATE INDEX idx_vaccinations_next_due ON public.vaccinations(next_due_date);
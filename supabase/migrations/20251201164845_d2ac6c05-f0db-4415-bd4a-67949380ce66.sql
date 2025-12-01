CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  date_of_birth DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  is_indoor BOOLEAN DEFAULT true,
  known_allergies TEXT,
  blood_group TEXT,
  pet_photo_url TEXT,
  unique_pet_id TEXT UNIQUE NOT NULL,
  vet_name TEXT,
  vet_phone TEXT,
  vet_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  chronic_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
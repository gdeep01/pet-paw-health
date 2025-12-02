-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- RLS Policies for pets table
CREATE POLICY "Users can view their own pets"
ON public.pets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
ON public.pets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
ON public.pets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Public read access for emergency profiles (via unique_pet_id)
CREATE POLICY "Anyone can view pets by unique_pet_id"
ON public.pets
FOR SELECT
TO anon
USING (true);

-- Storage policies for pet-photos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own pet photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pet photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pet photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Pet photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pet-photos');
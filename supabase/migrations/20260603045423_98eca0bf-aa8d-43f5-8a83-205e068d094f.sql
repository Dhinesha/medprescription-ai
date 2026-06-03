
-- Add user_id columns to scope data to authenticated users
ALTER TABLE public.hospital_templates ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS user_id uuid;

-- Drop overly-permissive policies on hospital_templates
DROP POLICY IF EXISTS "Anyone can create templates" ON public.hospital_templates;
DROP POLICY IF EXISTS "Anyone can delete templates" ON public.hospital_templates;
DROP POLICY IF EXISTS "Anyone can update templates" ON public.hospital_templates;
DROP POLICY IF EXISTS "Anyone can view templates" ON public.hospital_templates;

-- Templates: owner-scoped
CREATE POLICY "Users can view their own templates"
  ON public.hospital_templates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates"
  ON public.hospital_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates"
  ON public.hospital_templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates"
  ON public.hospital_templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Drop overly-permissive policies on prescriptions
DROP POLICY IF EXISTS "Anyone can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Anyone can delete prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Anyone can update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Anyone can view prescriptions" ON public.prescriptions;

CREATE POLICY "Users can view their own prescriptions"
  ON public.prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own prescriptions"
  ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prescriptions"
  ON public.prescriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage: hospital-logos bucket — restrict writes, scope to user folder
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete logos" ON storage.objects;

-- Keep public read (logos are shown on prescriptions) but restrict writes to owner-folder uploads
CREATE POLICY "Logos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hospital-logos');
CREATE POLICY "Authenticated users can upload logos to their folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hospital-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can update their own logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hospital-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can delete their own logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hospital-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

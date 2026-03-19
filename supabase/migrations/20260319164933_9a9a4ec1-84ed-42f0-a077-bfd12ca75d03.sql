-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Hospital templates table
CREATE TABLE public.hospital_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  doctor_name TEXT NOT NULL,
  department TEXT,
  registration_number TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hospital_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" ON public.hospital_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can create templates" ON public.hospital_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update templates" ON public.hospital_templates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete templates" ON public.hospital_templates FOR DELETE USING (true);

CREATE TRIGGER update_hospital_templates_updated_at
  BEFORE UPDATE ON public.hospital_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.hospital_templates(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prescription_text TEXT,
  raw_transcript TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update prescriptions" ON public.prescriptions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete prescriptions" ON public.prescriptions FOR DELETE USING (true);

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for hospital logos
INSERT INTO storage.buckets (id, name, public) VALUES ('hospital-logos', 'hospital-logos', true);

CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'hospital-logos');
CREATE POLICY "Anyone can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hospital-logos');
CREATE POLICY "Anyone can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'hospital-logos');
CREATE POLICY "Anyone can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'hospital-logos');
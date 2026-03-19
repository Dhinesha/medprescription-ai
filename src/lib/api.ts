import { supabase } from "@/integrations/supabase/client";
import type { HospitalTemplate, HospitalTemplateInsert } from "@/types/medical";

export async function fetchTemplates(): Promise<HospitalTemplate[]> {
  const { data, error } = await supabase
    .from("hospital_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTemplate(template: HospitalTemplateInsert): Promise<HospitalTemplate> {
  const { data, error } = await supabase
    .from("hospital_templates")
    .insert(template)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, template: Partial<HospitalTemplateInsert>): Promise<HospitalTemplate> {
  const { data, error } = await supabase
    .from("hospital_templates")
    .update(template)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("hospital_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hospital-logos").upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from("hospital-logos").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function savePrescription(prescription: {
  template_id: string | null;
  patient_name: string;
  age: string | null;
  gender: string | null;
  visit_date: string;
  prescription_text: string | null;
  raw_transcript: string | null;
  notes: string | null;
}) {
  const { data, error } = await supabase
    .from("prescriptions")
    .insert(prescription)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPrescriptions() {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*, hospital_templates(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deletePrescription(id: string) {
  const { error } = await supabase.from("prescriptions").delete().eq("id", id);
  if (error) throw error;
}

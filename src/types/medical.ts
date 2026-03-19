import { Database } from "@/integrations/supabase/types";

export type HospitalTemplate = Database["public"]["Tables"]["hospital_templates"]["Row"];
export type HospitalTemplateInsert = Database["public"]["Tables"]["hospital_templates"]["Insert"];
export type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];
export type PrescriptionInsert = Database["public"]["Tables"]["prescriptions"]["Insert"];

export type WorkflowStep = "template" | "patient" | "voice" | "preview";

export interface PatientInfo {
  patientName: string;
  age: string;
  gender: string;
  visitDate: string;
}

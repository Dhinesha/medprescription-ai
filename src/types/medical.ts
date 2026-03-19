export interface HospitalTemplate {
  id: string;
  hospitalName: string;
  address: string;
  phone: string;
  doctorName: string;
  department: string;
  registrationNumber: string;
}

export interface MedicalReport {
  id: string;
  patientName: string;
  age: string;
  gender: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  doctorAdvice: string;
  followUpDate: string;
  rawTranscript: string;
  createdAt: string;
  templateId?: string;
}

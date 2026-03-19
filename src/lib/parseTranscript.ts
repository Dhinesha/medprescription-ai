import type { MedicalReport } from "@/types/medical";

/**
 * Simple client-side parser that extracts fields from spoken text.
 * This is a fallback when AI is not available.
 */
export function parseTranscript(text: string): Partial<MedicalReport> {
  const lower = text.toLowerCase();
  const report: Partial<MedicalReport> = { rawTranscript: text };

  // Try to extract patient name
  const nameMatch = text.match(/(?:patient(?:'s)?\s+name\s+(?:is\s+)?|name\s+(?:is\s+)?)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (nameMatch) report.patientName = nameMatch[1].trim();

  // Age
  const ageMatch = text.match(/(?:age(?:d)?[\s:]+(\d{1,3})|(\d{1,3})\s*(?:years?\s*old|year|yrs?))/i);
  if (ageMatch) report.age = (ageMatch[1] || ageMatch[2]);

  // Gender
  if (lower.includes("female") || lower.includes("woman") || lower.includes("girl")) {
    report.gender = "Female";
  } else if (lower.includes("male") || lower.includes("man") || lower.includes("boy")) {
    report.gender = "Male";
  }

  // Chief complaint
  const complaintMatch = text.match(/(?:complaint|complaining\s+of|presenting\s+with|came\s+(?:in\s+)?(?:with|for))\s+(.+?)(?:\.|,|$)/i);
  if (complaintMatch) report.chiefComplaint = complaintMatch[1].trim();

  // Symptoms
  const symptomsMatch = text.match(/(?:symptoms?\s+(?:include|are|is|:)\s*)(.+?)(?:diagnosis|prescription|$)/is);
  if (symptomsMatch) report.symptoms = symptomsMatch[1].trim().replace(/\.\s*$/, "");

  // Diagnosis
  const diagMatch = text.match(/(?:diagnos(?:is|ed)\s+(?:is|as|with|:)\s*)(.+?)(?:prescri|advice|$)/is);
  if (diagMatch) report.diagnosis = diagMatch[1].trim().replace(/\.\s*$/, "");

  // Prescription
  const rxMatch = text.match(/(?:prescri(?:ption|be|bed)\s*(?:is|:)?\s*)(.+?)(?:advice|follow|$)/is);
  if (rxMatch) report.prescription = rxMatch[1].trim().replace(/\.\s*$/, "");

  // Advice
  const adviceMatch = text.match(/(?:advi(?:ce|se|sed)\s*(?:is|:|\s+to)?\s*)(.+?)(?:follow|$)/is);
  if (adviceMatch) report.doctorAdvice = adviceMatch[1].trim().replace(/\.\s*$/, "");

  return report;
}

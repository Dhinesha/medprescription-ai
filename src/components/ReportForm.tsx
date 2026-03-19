import { User, Calendar, Stethoscope, Pill, MessageSquare, CalendarCheck, FileText, Activity } from "lucide-react";
import type { MedicalReport } from "@/types/medical";

interface ReportFormProps {
  report: Partial<MedicalReport>;
  onChange: (field: keyof MedicalReport, value: string) => void;
}

const fields: { key: keyof MedicalReport; label: string; icon: any; multiline?: boolean }[] = [
  { key: "patientName", label: "Patient Name", icon: User },
  { key: "age", label: "Age", icon: Calendar },
  { key: "gender", label: "Gender", icon: User },
  { key: "chiefComplaint", label: "Chief Complaint", icon: FileText, multiline: true },
  { key: "symptoms", label: "Symptoms", icon: Activity, multiline: true },
  { key: "diagnosis", label: "Diagnosis", icon: Stethoscope, multiline: true },
  { key: "prescription", label: "Prescription", icon: Pill, multiline: true },
  { key: "doctorAdvice", label: "Doctor's Advice", icon: MessageSquare, multiline: true },
  { key: "followUpDate", label: "Follow-up Date", icon: CalendarCheck },
];

export default function ReportForm({ report, onChange }: ReportFormProps) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-medical-blue" />
        Medical Report
      </h2>

      <div className="space-y-4">
        {fields.map(({ key, label, icon: Icon, multiline }) => (
          <div key={key}>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1.5">
              <Icon className="w-4 h-4" />
              {label}
            </label>
            {multiline ? (
              <textarea
                value={(report[key] as string) || ""}
                onChange={e => onChange(key, e.target.value)}
                rows={3}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:ring-2 focus:ring-ring transition"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            ) : (
              <input
                type={key === "followUpDate" ? "date" : "text"}
                value={(report[key] as string) || ""}
                onChange={e => onChange(key, e.target.value)}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { User, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PatientInfo } from "@/types/medical";

interface PatientStepProps {
  patient: PatientInfo;
  onChange: (info: PatientInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PatientStep({ patient, onChange, onNext, onBack }: PatientStepProps) {
  const isValid = patient.patientName.trim() !== "";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <User className="w-6 h-6 text-medical-blue" />
        Patient Details
      </h2>

      <div className="bg-card rounded-2xl card-shadow p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            Patient Name <span className="text-destructive">*</span>
          </label>
          <input
            value={patient.patientName}
            onChange={e => onChange({ ...patient, patientName: e.target.value })}
            placeholder="Enter patient name"
            className="w-full bg-muted rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Age</label>
            <input
              value={patient.age}
              onChange={e => onChange({ ...patient, age: e.target.value })}
              placeholder="e.g. 45"
              className="w-full bg-muted rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Gender</label>
            <select
              value={patient.gender}
              onChange={e => onChange({ ...patient, gender: e.target.value })}
              className="w-full bg-muted rounded-xl px-4 py-3.5 text-base text-foreground outline-none focus:ring-2 focus:ring-ring transition cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Date
          </label>
          <input
            type="date"
            value={patient.visitDate}
            onChange={e => onChange({ ...patient, visitDate: e.target.value })}
            className="w-full bg-muted rounded-xl px-4 py-3.5 text-base text-foreground outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-14 text-base rounded-xl">
          ← Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 h-14 text-base font-semibold medical-gradient text-primary-foreground hover:opacity-90 rounded-xl"
        >
          Next: Voice Rx <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

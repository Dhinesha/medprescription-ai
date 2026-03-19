import { CheckCircle2 } from "lucide-react";
import type { WorkflowStep } from "@/types/medical";

interface StepIndicatorProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}

const steps: { id: WorkflowStep; label: string; number: number }[] = [
  { id: "template", label: "Template", number: 1 },
  { id: "patient", label: "Patient", number: 2 },
  { id: "voice", label: "Voice Rx", number: 3 },
  { id: "preview", label: "Preview", number: 4 },
];

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-4">
      {steps.map((step, i) => {
        const isComplete = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isPast = i < currentIdx;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCurrent
                    ? "medical-gradient text-primary-foreground shadow-lg scale-110"
                    : isComplete || isPast
                    ? "bg-medical-teal text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete || isPast ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium hidden sm:block ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 ${
                  isPast || isComplete ? "bg-medical-teal" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

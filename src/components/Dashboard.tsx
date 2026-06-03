import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/Header";
import StepIndicator from "@/components/StepIndicator";
import TemplateStep from "@/components/TemplateStep";
import PatientStep from "@/components/PatientStep";
import VoiceStep from "@/components/VoiceStep";
import PreviewStep from "@/components/PreviewStep";
import HistoryView from "@/components/HistoryView";
import PrescriptionScanner from "@/components/PrescriptionScanner";
import MedAssistant from "@/components/MedAssistant";
import ProductIdentifier from "@/components/ProductIdentifier";
import { fetchTemplates, fetchPrescriptions } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { HospitalTemplate, PatientInfo, WorkflowStep } from "@/types/medical";

export default function Dashboard() {
  const { role } = useAuth();
  const isDoctor = role === "doctor";
  const [activeTab, setActiveTab] = useState<string>("workflow");
  const [step, setStep] = useState<WorkflowStep>("template");
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);

  // Data
  const [templates, setTemplates] = useState<HospitalTemplate[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<HospitalTemplate | null>(null);
  const [patient, setPatient] = useState<PatientInfo>({
    patientName: "",
    age: "",
    gender: "",
    visitDate: new Date().toISOString().split("T")[0],
  });
  const [prescriptionText, setPrescriptionText] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: any) {
      toast.error("Failed to load templates");
    }
  }, []);

  const loadPrescriptions = useCallback(async () => {
    try {
      const data = await fetchPrescriptions();
      setPrescriptions(data);
    } catch (err: any) {
      toast.error("Failed to load prescriptions");
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadPrescriptions();
  }, [loadTemplates, loadPrescriptions]);

  const goToStep = (newStep: WorkflowStep) => {
    setStep(newStep);
  };

  const completeStep = (currentStep: WorkflowStep, nextStep: WorkflowStep) => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setStep(nextStep);
  };

  const handleReset = () => {
    setStep("template");
    setCompletedSteps([]);
    setPatient({ patientName: "", age: "", gender: "", visitDate: new Date().toISOString().split("T")[0] });
    setPrescriptionText("");
    loadPrescriptions();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "workflow" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <StepIndicator currentStep={step} completedSteps={completedSteps} />

            {step === "template" && (
              <TemplateStep
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
                onRefresh={loadTemplates}
                onNext={() => completeStep("template", "patient")}
              />
            )}

            {step === "patient" && (
              <PatientStep
                patient={patient}
                onChange={setPatient}
                onNext={() => completeStep("patient", "voice")}
                onBack={() => goToStep("template")}
              />
            )}

            {step === "voice" && (
              <VoiceStep
                prescriptionText={prescriptionText}
                onPrescriptionChange={setPrescriptionText}
                onNext={() => completeStep("voice", "preview")}
                onBack={() => goToStep("patient")}
              />
            )}

            {step === "preview" && selectedTemplate && (
              <PreviewStep
                template={selectedTemplate}
                patient={patient}
                prescriptionText={prescriptionText}
                onPrescriptionChange={setPrescriptionText}
                onBack={() => goToStep("voice")}
                onReset={handleReset}
              />
            )}
          </motion.div>
        )}

        {activeTab === "templates" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TemplateStep
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
              onRefresh={loadTemplates}
              onNext={() => { setActiveTab("workflow"); completeStep("template", "patient"); }}
            />
          </motion.div>
        )}

        {activeTab === "scanner" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PrescriptionScanner />
          </motion.div>
        )}

        {activeTab === "product" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProductIdentifier />
          </motion.div>
        )}

        {activeTab === "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MedAssistant />
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HistoryView prescriptions={prescriptions} onRefresh={loadPrescriptions} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

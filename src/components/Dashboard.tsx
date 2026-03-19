import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, FileText, Sparkles, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import VoiceRecorder from "@/components/VoiceRecorder";
import ReportForm from "@/components/ReportForm";
import ReportPreview from "@/components/ReportPreview";
import AIFormatButton from "@/components/AIFormatButton";
import TemplateManager from "@/components/TemplateManager";
import PatientRecords from "@/components/PatientRecords";
import { useAppStore } from "@/stores/useAppStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseTranscript } from "@/lib/parseTranscript";
import type { MedicalReport } from "@/types/medical";

const statCards = [
  { label: "Voice Input", desc: "Speak patient details", icon: Mic, color: "bg-medical-blue-light text-medical-blue" },
  { label: "AI Formatting", desc: "Auto-structure reports", icon: Sparkles, color: "bg-medical-teal-light text-medical-teal" },
  { label: "PDF Export", desc: "Download & print", icon: FileText, color: "bg-medical-green-light text-medical-green" },
  { label: "Records", desc: "Search & manage", icon: ClipboardList, color: "bg-muted text-medical-purple" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [language, setLanguage] = useState("en-US");
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<Partial<MedicalReport>>({});

  const store = useAppStore();

  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript } = useSpeechRecognition({ language });

  const handleFieldChange = useCallback((field: keyof MedicalReport, value: string) => {
    setReport(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAIFormat = useCallback(() => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    // Client-side parsing as fallback (AI backend can be added later)
    setTimeout(() => {
      const parsed = parseTranscript(transcript);
      setReport(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v)),
        rawTranscript: transcript,
      }));
      setIsProcessing(false);
      toast.success("Report generated from voice input!");
    }, 1000);
  }, [transcript]);

  const handleSaveReport = useCallback(() => {
    const fullReport: MedicalReport = {
      id: crypto.randomUUID(),
      patientName: report.patientName || "",
      age: report.age || "",
      gender: report.gender || "",
      chiefComplaint: report.chiefComplaint || "",
      symptoms: report.symptoms || "",
      diagnosis: report.diagnosis || "",
      prescription: report.prescription || "",
      doctorAdvice: report.doctorAdvice || "",
      followUpDate: report.followUpDate || "",
      rawTranscript: report.rawTranscript || transcript,
      createdAt: new Date().toISOString(),
      templateId: store.activeTemplate?.id,
    };
    store.saveReport(fullReport);
    toast.success("Report saved successfully!");
  }, [report, transcript, store]);

  const handleSelectRecord = useCallback((r: MedicalReport) => {
    setReport(r);
    setActiveTab("dashboard");
    toast.info(`Loaded report for ${r.patientName}`);
  }, []);

  const handleNewReport = useCallback(() => {
    setReport({});
    resetTranscript();
  }, [resetTranscript]);

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl card-shadow p-5"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* New report button */}
            {(report.patientName || transcript) && (
              <button
                onClick={handleNewReport}
                className="text-sm text-primary font-medium hover:underline"
              >
                + Start New Report
              </button>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column: Voice + AI */}
              <div className="space-y-4">
                <VoiceRecorder
                  isListening={isListening}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  language={language}
                  onStart={startListening}
                  onStop={stopListening}
                  onReset={resetTranscript}
                  onLanguageChange={setLanguage}
                />
                <AIFormatButton
                  transcript={transcript}
                  isProcessing={isProcessing}
                  onFormat={handleAIFormat}
                />
                <ReportForm report={report} onChange={handleFieldChange} />
              </div>

              {/* Right column: Preview */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <ReportPreview
                  report={report}
                  template={store.activeTemplate}
                  onSave={handleSaveReport}
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "templates" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TemplateManager
              templates={store.templates}
              activeTemplate={store.activeTemplate}
              onSave={store.saveTemplate}
              onDelete={store.deleteTemplate}
              onSelect={store.setActiveTemplate}
            />
          </motion.div>
        )}

        {activeTab === "records" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PatientRecords
              reports={store.reports}
              onDelete={store.deleteReport}
              onSelect={handleSelectRecord}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

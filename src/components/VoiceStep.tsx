import { Mic, MicOff, RotateCcw, Languages, Keyboard, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import MedicineSuggestions from "@/components/MedicineSuggestions";

interface VoiceStepProps {
  prescriptionText: string;
  onPrescriptionChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const languages = [
  { code: "en-US", label: "English" },
  { code: "ta-IN", label: "Tamil" },
];

export default function VoiceStep({ prescriptionText, onPrescriptionChange, onNext, onBack }: VoiceStepProps) {
  const [language, setLanguage] = useState("en-US");
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState("");

  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript } = useSpeechRecognition({ language });

  // Sync transcript to prescription
  const currentText = prescriptionText || transcript;

  const handleUseTranscript = () => {
    if (transcript.trim()) {
      onPrescriptionChange(transcript.trim());
    }
  };

  const handleManualSubmit = () => {
    if (manualText.trim()) {
      setManualTranscript(manualText.trim());
      onPrescriptionChange(manualText.trim());
      setManualText("");
    }
  };

  const hasContent = currentText.trim().length > 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-medical-teal" />
        Voice Prescription
      </h2>

      <div className="bg-card rounded-2xl card-shadow p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">Speak the prescription clearly</p>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-sm bg-muted text-foreground rounded-lg px-3 py-1.5 border-none outline-none cursor-pointer"
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        {/* Record button */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            {isListening && (
              <motion.div className="absolute inset-0 rounded-full bg-medical-red/20 animate-pulse-ring" style={{ margin: "-12px" }} />
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-medical-red text-primary-foreground scale-110"
                  : "medical-gradient text-primary-foreground hover:scale-105"
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {isListening ? 'Listening... Say: "Paracetamol 650mg twice daily after food"' : "Tap to start recording"}
          </p>

          <button onClick={() => setShowTextInput(!showTextInput)} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Keyboard className="w-4 h-4" />
            {showTextInput ? "Hide text input" : "Or type prescription instead"}
          </button>

          {showTextInput && (
            <div className="w-full space-y-3">
              <textarea
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                rows={4}
                placeholder='e.g. "Paracetamol 650mg twice daily after food. Tab Azithromycin 500mg once daily for 3 days. Syrup Benadryl 10ml at bedtime."'
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:ring-2 focus:ring-ring transition"
              />
              <Button onClick={handleManualSubmit} disabled={!manualText.trim()} className="w-full bg-primary text-primary-foreground">
                Use This Text
              </Button>
            </div>
          )}

          {/* Medicine quick-search */}
          <div className="w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Quick-add medicine:</p>
            <MedicineSuggestions
              onInsert={(line) => {
                const prev = (prescriptionText || transcript).trim();
                const next = prev ? `${prev}\n${line}` : line;
                onPrescriptionChange(next);
              }}
            />
          </div>

          {/* Transcript / prescription display */}
          {(transcript || interimTranscript || prescriptionText) && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Prescription Text</span>
                <Button variant="ghost" size="sm" onClick={() => { resetTranscript(); onPrescriptionChange(""); }} className="text-muted-foreground">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              </div>
              <textarea
                value={currentText}
                onChange={e => onPrescriptionChange(e.target.value)}
                rows={4}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-ring transition"
              />
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic mt-1">{interimTranscript}</p>
              )}
            </div>
          )}

          {transcript && !prescriptionText && (
            <Button onClick={handleUseTranscript} className="w-full bg-medical-teal text-primary-foreground">
              Use This Prescription
            </Button>
          )}

          {!isSupported && (
            <div className="w-full bg-medical-orange/10 text-medical-orange rounded-xl p-4 text-sm">
              Voice recording not available here. Use text input or open in Chrome.
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-14 text-base rounded-xl">← Back</Button>
        <Button
          onClick={onNext}
          disabled={!hasContent}
          className="flex-1 h-14 text-base font-semibold medical-gradient text-primary-foreground hover:opacity-90 rounded-xl"
        >
          Preview <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

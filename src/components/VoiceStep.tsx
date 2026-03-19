import { Mic, MicOff, RotateCcw, Languages, Keyboard, ArrowRight, Sparkles, PenLine, Volume2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
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
  { code: "hi-IN", label: "Hindi" },
  { code: "te-IN", label: "Telugu" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
];

export default function VoiceStep({ prescriptionText, onPrescriptionChange, onNext, onBack }: VoiceStepProps) {
  const [language, setLanguage] = useState("en-US");
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript } = useSpeechRecognition({ language });

  const currentText = prescriptionText || transcript;
  const hasContent = currentText.trim().length > 0;

  // Auto-scroll transcript sidebar
  useEffect(() => {
    if (transcriptEndRef.current && isListening) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, interimTranscript, isListening]);

  // Auto-sync transcript to prescription when speaking
  useEffect(() => {
    if (transcript && isListening) {
      onPrescriptionChange(transcript.trim());
    }
  }, [transcript, isListening]);

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

  const handleClear = () => {
    resetTranscript();
    onPrescriptionChange("");
    setIsEditing(false);
  };

  // Split transcript into spoken "lines" for the sidebar
  const spokenLines = currentText.split(/[.\n]/).filter(l => l.trim());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-medical-teal" />
        Voice Prescription
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl card-shadow p-6">
            {/* Language selector */}
            <div className="flex items-center justify-between mb-5">
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

            {/* Mic button */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-medical-red/20"
                    style={{ margin: "-14px" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isListening
                      ? "bg-medical-red text-primary-foreground scale-110"
                      : "medical-gradient text-primary-foreground hover:scale-105"
                  }`}
                >
                  {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={isListening ? "listening" : "idle"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-muted-foreground text-center"
                >
                  {isListening ? (
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-medical-red animate-pulse" />
                      Listening... speak your prescription
                    </span>
                  ) : "Tap the mic to start dictating"}
                </motion.p>
              </AnimatePresence>

              {/* Quick toggle for text input */}
              <button onClick={() => setShowTextInput(!showTextInput)} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <Keyboard className="w-4 h-4" />
                {showTextInput ? "Hide text input" : "Or type instead"}
              </button>

              {showTextInput && (
                <div className="w-full space-y-3">
                  <textarea
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    rows={3}
                    placeholder='e.g. "Paracetamol 650mg twice daily after food"'
                    className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <Button onClick={handleManualSubmit} disabled={!manualText.trim()} className="w-full bg-primary text-primary-foreground">
                    Add to Prescription
                  </Button>
                </div>
              )}

              {!isSupported && (
                <div className="w-full bg-medical-orange/10 text-medical-orange rounded-xl p-3 text-sm">
                  Voice not available. Use text input or open in Chrome.
                </div>
              )}
            </div>
          </div>

          {/* Medicine quick-search */}
          <div className="bg-card rounded-2xl card-shadow p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Quick-add Medicine</p>
            <MedicineSuggestions
              onInsert={(line) => {
                const prev = currentText.trim();
                const next = prev ? `${prev}\n${line}` : line;
                onPrescriptionChange(next);
              }}
            />
          </div>
        </div>

        {/* RIGHT: Live Transcript Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl card-shadow h-full flex flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isListening ? "bg-medical-red animate-pulse" : hasContent ? "bg-medical-teal" : "bg-muted-foreground/30"}`} />
                <span className="text-sm font-semibold text-foreground">Live Transcript</span>
              </div>
              <div className="flex items-center gap-1">
                {hasContent && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`text-xs h-7 px-2 ${isEditing ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                    >
                      <PenLine className="w-3 h-3 mr-1" />
                      {isEditing ? "Done" : "Edit"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground h-7 px-2">
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Transcript content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px]">
              {isEditing ? (
                <textarea
                  value={currentText}
                  onChange={e => onPrescriptionChange(e.target.value)}
                  className="w-full h-full min-h-[260px] bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-ring transition font-mono leading-relaxed"
                  placeholder="Edit your prescription here..."
                  autoFocus
                />
              ) : hasContent || interimTranscript ? (
                <div className="space-y-2">
                  {spokenLines.map((line, i) => (
                    <motion.div
                      key={`${i}-${line.slice(0, 10)}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-medical-teal mt-1 shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">{line.trim()}</p>
                    </motion.div>
                  ))}

                  {/* Live interim text */}
                  {interimTranscript && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-3.5 h-3.5 mt-1 shrink-0 rounded-full border-2 border-medical-red/50 animate-pulse" />
                      <p className="text-sm text-muted-foreground italic leading-relaxed">{interimTranscript}</p>
                    </motion.div>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <Mic className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your spoken words will appear here in real-time
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Tap the mic button to start, or type manually
                  </p>
                </div>
              )}
            </div>

            {/* Word count footer */}
            {hasContent && (
              <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {currentText.split(/\s+/).filter(Boolean).length} words • {spokenLines.length} lines
                </span>
                <span className="text-xs text-medical-teal font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
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

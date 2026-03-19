import { Mic, MicOff, RotateCcw, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  language: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { code: "en-US", label: "English" },
  { code: "ta-IN", label: "Tamil" },
];

export default function VoiceRecorder({
  isListening, transcript, interimTranscript, language,
  onStart, onStop, onReset, onLanguageChange,
}: VoiceRecorderProps) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Voice Input</h2>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            className="text-sm bg-muted text-foreground rounded-lg px-3 py-1.5 border-none outline-none cursor-pointer"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-medical-red/20 animate-pulse-ring"
              style={{ margin: "-12px" }}
            />
          )}
          <button
            onClick={isListening ? onStop : onStart}
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
          {isListening ? "Listening... Speak clearly" : "Tap to start recording"}
        </p>

        {/* Transcript display */}
        {(transcript || interimTranscript) && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Transcript</span>
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            </div>
            <div className="bg-muted rounded-xl p-4 max-h-48 overflow-y-auto text-sm leading-relaxed text-foreground">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground italic">{interimTranscript}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseSpeechRecognitionOptions {
  language?: string;
  /**
   * Word-by-word mode: only the last spoken word from each finalized phrase
   * is appended, and consecutive duplicates are ignored.
   */
  wordMode?: boolean;
}

/**
 * Common medical-term corrections applied to Web Speech API output.
 * The browser engine often mishears drug names; we patch the most frequent ones.
 */
const MEDICAL_CORRECTIONS: Array<[RegExp, string]> = [
  [/\bpara ?set ?a ?mol\b/gi, "Paracetamol"],
  [/\bpara ?cetamol\b/gi, "Paracetamol"],
  [/\bamoxi ?cillin\b/gi, "Amoxicillin"],
  [/\bazithro ?mycin\b/gi, "Azithromycin"],
  [/\bibu ?profen\b/gi, "Ibuprofen"],
  [/\bcetri ?zine\b/gi, "Cetirizine"],
  [/\bcetra ?zine\b/gi, "Cetirizine"],
  [/\bpanto ?prazole\b/gi, "Pantoprazole"],
  [/\bome ?prazole\b/gi, "Omeprazole"],
  [/\bmetfor ?min\b/gi, "Metformin"],
  [/\batorva ?statin\b/gi, "Atorvastatin"],
  [/\bdoloph?in\b/gi, "Dolo"],
  [/\bdollar 650\b/gi, "Dolo 650"],
  [/\bcrocin\b/gi, "Crocin"],
  [/\baugmenten?tin\b/gi, "Augmentin"],
  [/\bmono ?cef\b/gi, "Monocef"],
  // dosage units
  [/\b(\d+)\s*m\.?\s*g\.?\b/gi, "$1mg"],
  [/\b(\d+)\s*m\.?\s*l\.?\b/gi, "$1ml"],
  [/\bmilli ?grams?\b/gi, "mg"],
  [/\bmilli ?lit(?:re|er)s?\b/gi, "ml"],
  // frequency
  [/\bonce a day\b/gi, "OD"],
  [/\btwice a day\b/gi, "BD"],
  [/\bthrice a day\b/gi, "TDS"],
  [/\bthree times a day\b/gi, "TDS"],
  [/\bfour times a day\b/gi, "QID"],
  [/\bbefore food\b/gi, "before food"],
  [/\bafter food\b/gi, "after food"],
];

function applyMedicalCorrections(text: string): string {
  let out = text;
  for (const [pat, rep] of MEDICAL_CORRECTIONS) out = out.replace(pat, rep);
  // collapse whitespace
  return out.replace(/\s+/g, " ").trim();
}

/** Pick highest-confidence alternative from a SpeechRecognitionResult. */
function pickBest(result: any): string {
  let best = result[0];
  for (let i = 1; i < result.length; i++) {
    if ((result[i].confidence ?? 0) > (best.confidence ?? 0)) best = result[i];
  }
  return best.transcript as string;
}

export function useSpeechRecognition({ language = "en-US", wordMode = false }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const lastWordRef = useRef<string>("");
  const wordModeRef = useRef<boolean>(wordMode);
  wordModeRef.current = wordMode;

  const normalizeWord = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?;:"']+$/g, "");

  /**
   * Pre-warm the mic with high-quality constraints so the browser uses the
   * cleanest audio pipeline available for recognition. This noticeably
   * improves accuracy by enabling noise suppression / AGC / echo cancel.
   */
  const acquireMic = useCallback(async () => {
    if (micStreamRef.current) return micStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          googEchoCancellation: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googAutoGainControl: true,
        } as unknown as MediaTrackConstraints,
      });
      micStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.warn("Mic pre-warm failed (continuing without constraints):", err);
      return null;
    }
  }, []);

  const releaseMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error("Speech recognition not supported. Please use the text input below, or open this app in Chrome directly (not in an iframe).");
      return;
    }

    // Acquire a clean mic stream first - this primes Chrome's audio pipeline
    // with noise suppression + AGC before SpeechRecognition starts capturing.
    await acquireMic();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = !wordModeRef.current;
      recognition.interimResults = true;
      // Request multiple alternatives so we can pick the highest-confidence one
      recognition.maxAlternatives = 3;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const best = pickBest(res);
          if (res.isFinal) {
            final += best + " ";
          } else {
            interim += best;
          }
        }

        if (final) {
          const corrected = applyMedicalCorrections(final);
          if (wordModeRef.current) {
            const words = corrected.trim().split(/\s+/).filter(Boolean);
            const lastWord = words[words.length - 1];
            if (lastWord) {
              const norm = normalizeWord(lastWord);
              if (norm && norm !== lastWordRef.current) {
                lastWordRef.current = norm;
                setTranscript(prev => (prev ? prev + " " : "") + lastWord.trim());
              }
            }
          } else {
            setTranscript(prev => applyMedicalCorrections(prev + " " + corrected));
          }
        }
        const interimOut = applyMedicalCorrections(interim);
        setInterimTranscript(wordModeRef.current ? interimOut.trim().split(/\s+/).slice(-1)[0] || "" : interimOut);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please allow microphone permissions, or use the text input instead.");
          setIsListening(false);
          recognitionRef.current = null;
          releaseMic();
        } else if (event.error === "audio-capture") {
          toast.error("No microphone detected. Check your device.");
          setIsListening(false);
          recognitionRef.current = null;
          releaseMic();
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.error(`Voice error: ${event.error}. Try using text input instead.`);
          setIsListening(false);
          recognitionRef.current = null;
          releaseMic();
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
      lastWordRef.current = "";
      recognition.start();
      setIsListening(true);
      toast.success(wordModeRef.current ? "Word mode: speak one word at a time" : "Listening... Speak clearly");
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsSupported(false);
      releaseMic();
      toast.error("Could not start voice recording. Use the text input below instead.");
    }
  }, [language, acquireMic, releaseMic]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
    releaseMic();
  }, [releaseMic]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    lastWordRef.current = "";
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
    const words = text.trim().split(/\s+/).filter(Boolean);
    lastWordRef.current = words.length ? normalizeWord(words[words.length - 1]) : "";
  }, []);

  // Cleanup mic on unmount
  useEffect(() => () => releaseMic(), [releaseMic]);

  return { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript };
}

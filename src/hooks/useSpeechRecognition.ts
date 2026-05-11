import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseSpeechRecognitionOptions {
  language?: string;
  /**
   * Word-by-word mode: only the last spoken word from each finalized phrase
   * is appended, and consecutive duplicates are ignored. Useful for
   * dictating one word at a time with short pauses without getting
   * "apple apple apple" repetitions.
   */
  wordMode?: boolean;
}

export function useSpeechRecognition({ language = "en-US", wordMode = false }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const lastWordRef = useRef<string>("");
  const wordModeRef = useRef<boolean>(wordMode);
  wordModeRef.current = wordMode;

  const normalizeWord = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?;:"']+$/g, "");

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error("Speech recognition not supported. Please use the text input below, or open this app in Chrome directly (not in an iframe).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // In word mode, run short bursts and restart, so each utterance is fresh
      // and the result buffer can't accumulate duplicates across pauses.
      recognition.continuous = !wordModeRef.current;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }

        if (final) {
          if (wordModeRef.current) {
            // Take only the LAST word of the finalized chunk and dedupe
            // against the previously-added word.
            const words = final.trim().split(/\s+/).filter(Boolean);
            const lastWord = words[words.length - 1];
            if (lastWord) {
              const norm = normalizeWord(lastWord);
              if (norm && norm !== lastWordRef.current) {
                lastWordRef.current = norm;
                setTranscript(prev => (prev ? prev + " " : "") + lastWord.trim());
              }
            }
          } else {
            setTranscript(prev => prev + final);
          }
        }
        setInterimTranscript(wordModeRef.current ? interim.trim().split(/\s+/).slice(-1)[0] || "" : interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please allow microphone permissions, or use the text input instead.");
          setIsListening(false);
          recognitionRef.current = null;
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.error(`Voice error: ${event.error}. Try using text input instead.`);
          setIsListening(false);
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        // Auto-restart while we still have a ref (user hasn't stopped)
        if (recognitionRef.current) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
      lastWordRef.current = "";
      recognition.start();
      setIsListening(true);
      toast.success(wordModeRef.current ? "Word mode: speak one word at a time" : "Listening... Speak now");
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsSupported(false);
      toast.error("Could not start voice recording. Use the text input below instead.");
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

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

  return { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript };
}

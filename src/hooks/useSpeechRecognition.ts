import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseSpeechRecognitionOptions {
  language?: string;
}

export function useSpeechRecognition({ language = "en-US" }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error("Speech recognition not supported. Please use the text input below, or open this app in Chrome directly (not in an iframe).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        // Only iterate from resultIndex to avoid re-appending previous final results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }
        if (final) setTranscript(prev => prev + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please allow microphone permissions, or use the text input instead.");
          setIsListening(false);
          recognitionRef.current = null;
        } else if (event.error !== "no-speech") {
          toast.error(`Voice error: ${event.error}. Try using text input instead.`);
          setIsListening(false);
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      toast.success("Listening... Speak now");
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsSupported(false);
      toast.error("Could not start voice recording. Use the text input below instead.");
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  return { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript, setManualTranscript };
}

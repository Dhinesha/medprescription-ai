import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, Pill, Clock, Utensils, AlertTriangle, FileText, Bell, BellRing, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionTable from "@/components/PrescriptionTable";
import type { PrescriptionRow } from "@/lib/prescriptionParser";
import { detectMedicineType } from "@/lib/prescriptionParser";

interface ScanResult {
  medicines: {
    name: string;
    dosage: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    beforeFood: boolean;
    afterFood: boolean;
    duration: string;
  }[];
  foodSuggestions: string[];
  warnings: string[];
}

interface ReminderSlot {
  time: string;
  label: string;
  medicines: string[];
  foodInstruction?: string;
}

interface ActiveReminder {
  id: number;
  medicine: string;
  time: string;
  label: string;
  active: boolean;
}

export default function PrescriptionScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [reminders, setReminders] = useState<any>(null);
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [alertVisible, setAlertVisible] = useState<ActiveReminder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const reminderTimers = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      reminderTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const handleImage = async (file: File) => {
    setPdfName(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setResult(null);
      setReminders(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePdf = async (file: File) => {
    setImagePreview(null);
    setPdfName(file.name);
    setResult(null);
    setReminders(null);

    // Convert PDF first page to image using pdfjs
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const scale = 2;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const imageDataUrl = canvas.toDataURL("image/png");
      setImagePreview(imageDataUrl);
      toast.success("PDF converted for analysis");
    } catch (err) {
      console.error("PDF conversion error:", err);
      toast.error("Failed to process PDF. Try uploading an image instead.");
      setPdfName(null);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      handlePdf(file);
    } else if (file.type.startsWith("image/")) {
      handleImage(file);
    } else {
      toast.error("Please upload an image or PDF file");
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    try {
      const base64 = imagePreview.split(",")[1];

      const { data, error } = await supabase.functions.invoke("med-assistant", {
        body: {
          image_base64: base64,
          type: "scan_prescription",
        },
      });
      if (error) throw error;
      const content = data.result;
      if (!content) throw new Error("No result from analysis");
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || content);
      setResult(parsed);
      toast.success("Prescription analyzed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to analyze. Please try a clearer image or PDF.");
    } finally {
      setAnalyzing(false);
    }
  };

  const generateReminders = async () => {
    if (!result) return;
    try {
      const medList = result.medicines.map(m =>
        `${m.name} ${m.dosage} - ${[m.morning && "morning", m.afternoon && "afternoon", m.night && "night"].filter(Boolean).join(", ")} - ${m.beforeFood ? "before food" : "after food"} - ${m.duration}`
      ).join("\n");

      const { data, error } = await supabase.functions.invoke("med-assistant", {
        body: { prompt: `Create a daily medicine schedule for:\n${medList}`, type: "set_reminders" },
      });
      if (error) throw error;
      const content = data.result;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || content);
      setReminders(parsed);

      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      toast.success("Medicine schedule created!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate schedule");
    }
  };

  const startReminders = () => {
    if (!reminders?.schedule) return;

    // Clear old timers
    reminderTimers.current.forEach(t => clearTimeout(t));
    reminderTimers.current = [];

    const newActiveReminders: ActiveReminder[] = [];
    let id = 0;

    reminders.schedule.forEach((slot: ReminderSlot) => {
      slot.medicines?.forEach((med: string) => {
        const reminder: ActiveReminder = {
          id: id++,
          medicine: med,
          time: slot.time,
          label: slot.label,
          active: true,
        };
        newActiveReminders.push(reminder);

        // Schedule a demo notification in staggered intervals (5s, 10s, 15s...)
        // In production, these would be scheduled at actual times
        const delay = reminder.id * 5000 + 3000;
        const timer = window.setTimeout(() => {
          triggerAlert(reminder);
        }, delay);
        reminderTimers.current.push(timer);
      });
    });

    setActiveReminders(newActiveReminders);
    toast.success(`${newActiveReminders.length} reminders set! You'll get alerts for each medicine.`);
  };

  const triggerAlert = (reminder: ActiveReminder) => {
    // Play alert sound
    playAlertSound();

    // Show in-app alert
    setAlertVisible(reminder);

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💊 Medicine Reminder", {
        body: `Time to take: ${reminder.medicine}\n${reminder.label} - ${reminder.time}`,
        icon: "/favicon.ico",
        tag: `med-${reminder.id}`,
        requireInteraction: true,
      });
    }

    // Auto-dismiss in-app alert after 15s
    setTimeout(() => {
      setAlertVisible(prev => prev?.id === reminder.id ? null : prev);
    }, 15000);
  };

  const playAlertSound = () => {
    try {
      // Create a simple alert tone using Web Audio API
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1000;
        setTimeout(() => {
          oscillator.frequency.value = 800;
          setTimeout(() => {
            oscillator.stop();
            ctx.close();
          }, 200);
        }, 200);
      }, 200);
    } catch (e) {
      console.warn("Could not play alert sound:", e);
    }
  };

  const dismissAlert = () => {
    setAlertVisible(null);
  };

  const parsedRows: PrescriptionRow[] = result?.medicines.map(m => ({
    name: m.name,
    dosage: m.dosage,
    morning: m.morning,
    afternoon: m.afternoon,
    night: m.night,
    beforeFood: m.beforeFood,
    afterFood: m.afterFood,
    duration: m.duration,
    instructions: "",
    type: detectMedicineType(m.name),
  })) || [];

  return (
    <div className="space-y-6">
      {/* In-app Alert Popup */}
      <AnimatePresence>
        {alertVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md"
          >
            <div className="bg-card border-2 border-medical-teal rounded-2xl card-shadow p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-medical-teal/20 flex items-center justify-center animate-pulse">
                  <BellRing className="w-6 h-6 text-medical-teal" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-base">💊 Medicine Reminder</h4>
                  <p className="text-sm text-muted-foreground">{alertVisible.label} — {alertVisible.time}</p>
                </div>
                <Volume2 className="w-5 h-5 text-medical-orange animate-pulse" />
              </div>
              <div className="bg-medical-teal/10 rounded-xl p-3">
                <p className="font-semibold text-foreground text-sm">Take: {alertVisible.medicine}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={dismissAlert} className="flex-1 bg-medical-teal text-primary-foreground hover:opacity-90 h-10">
                  ✓ Taken
                </Button>
                <Button onClick={dismissAlert} variant="outline" className="flex-1 h-10">
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Camera className="w-6 h-6 text-primary" />
        Prescription Scanner
      </h2>
      <p className="text-sm text-muted-foreground">Upload an image, PDF, or take a photo of a prescription to analyze medicines, timing & food suggestions</p>

      {/* Upload area */}
      <div className="bg-card rounded-2xl card-shadow p-6">
        {!imagePreview ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => cameraInputRef.current?.click()} className="medical-gradient text-primary-foreground">
                <Camera className="w-4 h-4 mr-2" /> Take Photo
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </Button>
              <Button variant="outline" onClick={() => pdfInputRef.current?.click()} className="border-medical-orange/50 text-medical-orange hover:bg-medical-orange/10">
                <FileText className="w-4 h-4 mr-2" /> Upload PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Supports: JPG, PNG, PDF documents</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            {pdfName ? (
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                <div className="w-14 h-14 rounded-xl bg-medical-orange/15 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-medical-orange" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{pdfName}</p>
                  <p className="text-xs text-muted-foreground">PDF Document ready for analysis</p>
                </div>
              </div>
            ) : (
              <div className="relative max-h-64 overflow-hidden rounded-xl">
                <img src={imagePreview} alt="Prescription" className="w-full object-contain max-h-64" />
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={analyzeImage} disabled={analyzing} className="flex-1 medical-gradient text-primary-foreground h-12">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Pill className="w-4 h-4 mr-2" /> Analyze Prescription</>}
              </Button>
              <Button variant="outline" onClick={() => { setImagePreview(null); setPdfName(null); setResult(null); setReminders(null); }}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Medicines table */}
            <div className="bg-card rounded-2xl card-shadow p-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" /> Extracted Medicines
              </h3>
              <PrescriptionTable rows={parsedRows} showTracker={true} />
            </div>

            {/* Food suggestions */}
            {result.foodSuggestions?.length > 0 && (
              <div className="bg-medical-teal-light rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-medical-teal" /> Food Suggestions
                </h3>
                <ul className="space-y-1.5">
                  {result.foodSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-medical-teal mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="bg-medical-orange/10 rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-medical-orange" /> Warnings
                </h3>
                <ul className="space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-medical-orange mt-0.5">⚠</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generate reminders */}
            <Button onClick={generateReminders} className="w-full h-12 bg-medical-teal text-primary-foreground hover:opacity-90">
              <Clock className="w-4 h-4 mr-2" /> Generate Medicine Schedule & Reminders
            </Button>

            {/* Schedule */}
            {reminders && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl card-shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Daily Medicine Schedule
                  </h3>
                  <Button
                    onClick={startReminders}
                    className="bg-medical-orange text-primary-foreground hover:opacity-90 h-9 text-xs"
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5" /> Set Alerts
                  </Button>
                </div>

                {/* Active reminders badge */}
                {activeReminders.length > 0 && (
                  <div className="bg-medical-green/10 rounded-xl p-3 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-medical-green" />
                    <span className="text-sm font-medium text-foreground">
                      {activeReminders.length} reminders active — you'll get browser notifications & alerts
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {reminders.schedule?.map((slot: ReminderSlot, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="text-center shrink-0">
                        <div className="text-lg font-bold text-primary">{slot.time}</div>
                        <div className="text-xs text-muted-foreground">{slot.label}</div>
                      </div>
                      <div className="flex-1">
                        <ul className="space-y-1">
                          {slot.medicines?.map((med: string, j: number) => (
                            <li key={j} className="text-sm font-medium text-foreground flex items-center gap-1.5">
                              <Pill className="w-3 h-3 text-primary" /> {med}
                            </li>
                          ))}
                        </ul>
                        {slot.foodInstruction && (
                          <p className="text-xs text-medical-teal mt-1 flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> {slot.foodInstruction}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {reminders.foodTips?.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Tips:</p>
                    {reminders.foodTips.map((tip: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

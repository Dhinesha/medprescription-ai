import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Pill, Clock, Utensils, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionTable from "@/components/PrescriptionTable";
import type { PrescriptionRow } from "@/lib/prescriptionParser";

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

export default function PrescriptionScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [reminders, setReminders] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setResult(null);
      setReminders(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    try {
      const base64 = imagePreview.split(",")[1];
      const { data, error } = await supabase.functions.invoke("med-assistant", {
        body: { image_base64: base64, type: "scan_prescription" },
      });
      if (error) throw error;
      const content = data.result;
      // Parse JSON from response (may be wrapped in markdown code block)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || content);
      setResult(parsed);
      toast.success("Prescription analyzed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to analyze. Please try a clearer image.");
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
    type: "tablet" as const,
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Camera className="w-6 h-6 text-primary" />
        Prescription Scanner
      </h2>
      <p className="text-sm text-muted-foreground">Upload or take a photo of a prescription to analyze medicines, timing & food suggestions</p>

      {/* Upload area */}
      <div className="bg-card rounded-2xl card-shadow p-6">
        {!imagePreview ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => cameraInputRef.current?.click()} className="medical-gradient text-primary-foreground">
                <Camera className="w-4 h-4 mr-2" /> Take Photo
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative max-h-64 overflow-hidden rounded-xl">
              <img src={imagePreview} alt="Prescription" className="w-full object-contain max-h-64" />
            </div>
            <div className="flex gap-3">
              <Button onClick={analyzeImage} disabled={analyzing} className="flex-1 medical-gradient text-primary-foreground h-12">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Pill className="w-4 h-4 mr-2" /> Analyze Prescription</>}
              </Button>
              <Button variant="outline" onClick={() => { setImagePreview(null); setResult(null); setReminders(null); }}>
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
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Daily Medicine Schedule
                </h3>
                <div className="space-y-3">
                  {reminders.schedule?.map((slot: any, i: number) => (
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

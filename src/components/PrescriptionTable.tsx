import { useState } from "react";
import { Check, X, Sun, Cloud, Moon, Calendar, ChevronDown, ChevronUp, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PrescriptionRow, MedicineType } from "@/lib/prescriptionParser";

const typeConfig: Record<MedicineType, { label: string; emoji: string; bg: string; border: string; text: string; badge: string }> = {
  tablet:    { label: "Tablet",    emoji: "💊", bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-l-blue-500",    text: "text-blue-700 dark:text-blue-300",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  capsule:   { label: "Capsule",   emoji: "🔵", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-l-purple-500",  text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
  syrup:     { label: "Syrup",     emoji: "🧴", bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-l-amber-500",   text: "text-amber-700 dark:text-amber-300",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  injection: { label: "Injection", emoji: "💉", bg: "bg-red-50 dark:bg-red-950/30",      border: "border-l-red-500",     text: "text-red-700 dark:text-red-300",       badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  ointment:  { label: "Ointment",  emoji: "🧴", bg: "bg-green-50 dark:bg-green-950/30",  border: "border-l-green-500",   text: "text-green-700 dark:text-green-300",   badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  drops:     { label: "Drops",     emoji: "💧", bg: "bg-cyan-50 dark:bg-cyan-950/30",    border: "border-l-cyan-500",    text: "text-cyan-700 dark:text-cyan-300",     badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" },
  inhaler:   { label: "Inhaler",   emoji: "🌬️", bg: "bg-teal-50 dark:bg-teal-950/30",    border: "border-l-teal-500",    text: "text-teal-700 dark:text-teal-300",     badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" },
  other:     { label: "Other",     emoji: "📋", bg: "bg-gray-50 dark:bg-gray-950/30",    border: "border-l-gray-500",    text: "text-gray-700 dark:text-gray-300",     badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300" },
};

interface PrescriptionTableProps {
  rows: PrescriptionRow[];
  showTracker?: boolean;
}

export default function PrescriptionTable({ rows, showTracker = false }: PrescriptionTableProps) {
  const [expandedMed, setExpandedMed] = useState<number | null>(null);
  // Track taken status: { [medIndex]: { [dayIndex]: { morning: boolean, afternoon: boolean, night: boolean } } }
  const [takenStatus, setTakenStatus] = useState<Record<number, Record<number, Record<string, boolean>>>>({});

  if (rows.length === 0) return null;

  const Tick = () => (
    <div className="w-6 h-6 rounded-full bg-medical-teal/15 flex items-center justify-center mx-auto">
      <Check className="w-3.5 h-3.5 text-medical-teal" />
    </div>
  );
  const Dash = () => (
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
      <X className="w-3 h-3 text-muted-foreground/30" />
    </div>
  );

  const parseDuration = (dur: string): number => {
    const match = dur.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  };

  const toggleTaken = (medIdx: number, dayIdx: number, slot: string) => {
    setTakenStatus(prev => {
      const med = prev[medIdx] || {};
      const day = med[dayIdx] || {};
      return {
        ...prev,
        [medIdx]: {
          ...med,
          [dayIdx]: { ...day, [slot]: !day[slot] },
        },
      };
    });
  };

  const isTaken = (medIdx: number, dayIdx: number, slot: string): boolean => {
    return takenStatus[medIdx]?.[dayIdx]?.[slot] || false;
  };

  const getCompletionPercent = (medIdx: number, row: PrescriptionRow): number => {
    const days = parseDuration(row.duration);
    const slots = [row.morning && "morning", row.afternoon && "afternoon", row.night && "night"].filter(Boolean) as string[];
    if (slots.length === 0) return 0;
    const total = days * slots.length;
    let done = 0;
    for (let d = 0; d < days; d++) {
      for (const s of slots) {
        if (isTaken(medIdx, d, s)) done++;
      }
    }
    return Math.round((done / total) * 100);
  };

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left py-2.5 px-3 font-semibold text-primary border border-primary/20 w-8">#</th>
              <th className="text-left py-2.5 px-3 font-semibold text-primary border border-primary/20">Medicine</th>
              <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-20">Dosage</th>
              <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-14">
                <div className="flex flex-col items-center gap-0.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Morn</span>
                </div>
              </th>
              <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-14">
                <div className="flex flex-col items-center gap-0.5">
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Noon</span>
                </div>
              </th>
              <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-14">
                <div className="flex flex-col items-center gap-0.5">
                  <Moon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Night</span>
                </div>
              </th>
              <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-24">
                <span className="text-[10px]">Before / After</span><br />
                <span className="text-[10px]">Food</span>
              </th>
              <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-20">Duration</th>
              {showTracker && (
                <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-24">Progress</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const completion = showTracker ? getCompletionPercent(i, row) : 0;
              return (
                <>
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="py-2.5 px-3 border border-border text-muted-foreground font-mono text-xs text-center">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3 border border-border font-medium text-foreground">
                      {row.name}
                      {row.instructions && (
                        <span className="block text-xs text-muted-foreground mt-0.5">{row.instructions}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 border border-border text-center font-semibold text-foreground">
                      {row.dosage || "—"}
                    </td>
                    <td className="py-2.5 px-2 border border-border text-center">
                      {row.morning ? <Tick /> : <Dash />}
                    </td>
                    <td className="py-2.5 px-2 border border-border text-center">
                      {row.afternoon ? <Tick /> : <Dash />}
                    </td>
                    <td className="py-2.5 px-2 border border-border text-center">
                      {row.night ? <Tick /> : <Dash />}
                    </td>
                    <td className="py-2.5 px-2 border border-border text-center">
                      <div className="flex justify-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          row.beforeFood
                            ? "bg-medical-orange/15 text-medical-orange"
                            : "bg-muted text-muted-foreground/40"
                        }`}>
                          BF {row.beforeFood ? "✓" : ""}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          row.afterFood
                            ? "bg-medical-teal/15 text-medical-teal"
                            : "bg-muted text-muted-foreground/40"
                        }`}>
                          AF {row.afterFood ? "✓" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border border-border text-center">
                      <span className="text-xs font-medium text-foreground">{row.duration || "—"}</span>
                    </td>
                    {showTracker && (
                      <td className="py-2.5 px-3 border border-border text-center">
                        <button
                          onClick={() => setExpandedMed(expandedMed === i ? null : i)}
                          className="flex items-center gap-1.5 mx-auto"
                        >
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${completion}%`,
                                background: completion === 100
                                  ? "hsl(var(--medical-green))"
                                  : completion > 50
                                  ? "hsl(var(--medical-teal))"
                                  : "hsl(var(--medical-orange))",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">{completion}%</span>
                          {expandedMed === i ? (
                            <ChevronUp className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>

                  {/* Expanded day-by-day tracker */}
                  {showTracker && expandedMed === i && (
                    <tr key={`tracker-${i}`}>
                      <td colSpan={9} className="p-0 border border-border">
                        <AnimatePresence>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-muted/20 p-4 overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold text-foreground">
                                Daily Tracker — {row.name} ({row.duration || "5 days"})
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="text-xs border-collapse">
                                <thead>
                                  <tr>
                                    <th className="py-1.5 px-2 text-left text-muted-foreground border border-border bg-muted/50 w-16">Day</th>
                                    {row.morning && (
                                      <th className="py-1.5 px-3 text-center border border-border bg-muted/50">
                                        <Sun className="w-3 h-3 mx-auto mb-0.5 text-medical-orange" />
                                        Morning
                                      </th>
                                    )}
                                    {row.afternoon && (
                                      <th className="py-1.5 px-3 text-center border border-border bg-muted/50">
                                        <Cloud className="w-3 h-3 mx-auto mb-0.5 text-primary" />
                                        Noon
                                      </th>
                                    )}
                                    {row.night && (
                                      <th className="py-1.5 px-3 text-center border border-border bg-muted/50">
                                        <Moon className="w-3 h-3 mx-auto mb-0.5 text-medical-purple" />
                                        Night
                                      </th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from({ length: parseDuration(row.duration) }, (_, dayIdx) => (
                                    <tr key={dayIdx} className={dayIdx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                      <td className="py-1.5 px-2 border border-border font-medium text-muted-foreground">
                                        Day {dayIdx + 1}
                                      </td>
                                      {row.morning && (
                                        <td className="py-1.5 px-3 border border-border text-center">
                                          <button
                                            onClick={() => toggleTaken(i, dayIdx, "morning")}
                                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                                              isTaken(i, dayIdx, "morning")
                                                ? "bg-medical-teal border-medical-teal"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                          >
                                            {isTaken(i, dayIdx, "morning") && (
                                              <Check className="w-4 h-4 text-primary-foreground" />
                                            )}
                                          </button>
                                        </td>
                                      )}
                                      {row.afternoon && (
                                        <td className="py-1.5 px-3 border border-border text-center">
                                          <button
                                            onClick={() => toggleTaken(i, dayIdx, "afternoon")}
                                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                                              isTaken(i, dayIdx, "afternoon")
                                                ? "bg-medical-teal border-medical-teal"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                          >
                                            {isTaken(i, dayIdx, "afternoon") && (
                                              <Check className="w-4 h-4 text-primary-foreground" />
                                            )}
                                          </button>
                                        </td>
                                      )}
                                      {row.night && (
                                        <td className="py-1.5 px-3 border border-border text-center">
                                          <button
                                            onClick={() => toggleTaken(i, dayIdx, "night")}
                                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                                              isTaken(i, dayIdx, "night")
                                                ? "bg-medical-teal border-medical-teal"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                          >
                                            {isTaken(i, dayIdx, "night") && (
                                              <Check className="w-4 h-4 text-primary-foreground" />
                                            )}
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-medical-teal/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-medical-teal" /></div> Take</span>
        <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center"><X className="w-2.5 h-2.5 text-muted-foreground/30" /></div> Skip</span>
        <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded-full bg-medical-orange/15 text-medical-orange text-[10px]">BF</span> Before Food</span>
        <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded-full bg-medical-teal/15 text-medical-teal text-[10px]">AF</span> After Food</span>
      </div>
    </div>
  );
}

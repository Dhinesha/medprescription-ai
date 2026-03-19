import { useState, useRef, useEffect } from "react";
import { Pill, Plus, ChevronDown, Clock } from "lucide-react";
import { searchMedicines, formatMedicineLine, timingOptions, type Medicine } from "@/lib/medicineDatabase";

interface MedicineSuggestionsProps {
  onInsert: (text: string) => void;
}

export default function MedicineSuggestions({ onInsert }: MedicineSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<Record<number, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchMedicines(query));
    setShowDropdown(query.length >= 2);
    setExpandedIdx(null);
    setSelectedTiming({});
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInsert = (med: Medicine, sIdx: number, fIdx: number, iIdx: number, medIdx: number) => {
    onInsert(formatMedicineLine(med, sIdx, fIdx, iIdx, selectedTiming[medIdx]));
    setQuery("");
    setShowDropdown(false);
  };

  const handleQuickInsert = (med: Medicine, medIdx: number) => {
    onInsert(formatMedicineLine(med, 0, 0, 0, selectedTiming[medIdx]));
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
        <Pill className="w-4 h-4 text-primary shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search medicine (e.g. Paracetamol, Amoxicillin...)"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-[400px] overflow-y-auto">
          {results.map((med, idx) => (
            <div key={med.name} className="border-b border-border last:border-0">
              <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 cursor-pointer group">
                <button
                  onClick={() => handleQuickInsert(med, idx)}
                  className="flex-1 text-left flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium text-foreground">{med.form} {med.name}</span>
                  <span className="text-xs text-muted-foreground">{med.strengths[0]}</span>
                  <span className="text-xs text-muted-foreground">• {med.frequencies[0]}</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setExpandedIdx(expandedIdx === idx ? null : idx); }}
                  className="p-1 hover:bg-accent rounded-md"
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedIdx === idx ? "rotate-180" : ""}`} />
                </button>
              </div>

              {expandedIdx === idx && (
                <div className="px-4 pb-3 pt-1 space-y-3 bg-accent/30">
                  {/* Timing selector */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> When to take:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {timingOptions.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTiming(prev => ({ ...prev, [idx]: prev[idx] === t ? "" : t }))}
                          className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
                            selectedTiming[idx] === t
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dosage options */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1.5">Choose dosage:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {med.strengths.filter(Boolean).map((s, sIdx) =>
                        med.frequencies.map((f, fIdx) =>
                          med.instructions.map((inst, iIdx) => {
                            const label = `${s} ${f}${inst ? " " + inst : ""}`;
                            return (
                              <button
                                key={`${sIdx}-${fIdx}-${iIdx}`}
                                onClick={() => handleInsert(med, sIdx, fIdx, iIdx, idx)}
                                className="text-xs bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
                              >
                                {label}
                              </button>
                            );
                          })
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">No medicines found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

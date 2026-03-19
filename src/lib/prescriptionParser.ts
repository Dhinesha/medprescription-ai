// Parses prescription text lines into structured table rows
export type MedicineType = "tablet" | "capsule" | "syrup" | "injection" | "ointment" | "drops" | "inhaler" | "other";

export interface PrescriptionRow {
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  beforeFood: boolean;
  afterFood: boolean;
  duration: string;
  instructions: string;
  type: MedicineType;
}

export function detectMedicineType(line: string): MedicineType {
  const lower = line.toLowerCase();
  if (/\b(tab|tablet)\b/i.test(lower)) return "tablet";
  if (/\b(cap|capsule)\b/i.test(lower)) return "capsule";
  if (/\b(syp|syrup|suspension|liquid)\b/i.test(lower)) return "syrup";
  if (/\b(inj|injection|iv|im)\b/i.test(lower)) return "injection";
  if (/\b(ointment|cream|gel|lotion)\b/i.test(lower)) return "ointment";
  if (/\b(e\/d|drops|eye|ear|nasal)\b/i.test(lower)) return "drops";
  if (/\b(inhaler|rotacap|puff)\b/i.test(lower)) return "inhaler";
  return "tablet"; // default
}

export function parsePrescriptionLines(text: string): PrescriptionRow[] {
  const lines = text.split(/[.\n]/).map(s => s.trim()).filter(Boolean);
  return lines.map(line => {
    const lower = line.toLowerCase();

    // Extract medicine name (first 1-3 words before dosage)
    const nameMatch = line.match(/^(?:tab|cap|syp|syrup|inj|ointment|cream|gel|e\/d|inhaler)?\s*([A-Za-z\s\-]+?)(?=\s*\d|\s*(?:twice|thrice|once|four|SOS|morning|evening|night|daily|—|$))/i);
    const name = nameMatch ? nameMatch[0].trim() : line.split(/\s+/).slice(0, 2).join(" ");

    // Extract dosage/strength
    const dosageMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|%|IU))/i);
    const dosage = dosageMatch ? dosageMatch[1] : "";

    // Determine timing
    const morning = /\b(morning|morn|once daily|twice daily|thrice daily|three times|BD|TDS|OD)\b/i.test(lower) ||
                    /morning\s*(?:&|,|and)/i.test(lower) ||
                    /morning/i.test(lower);
    
    const afternoon = /\b(afternoon|noon|twice daily|thrice daily|three times|BD|TDS)\b/i.test(lower) ||
                      /afternoon/i.test(lower);
    
    const night = /\b(night|bedtime|HS|twice daily|thrice daily|three times|BD|TDS)\b/i.test(lower) ||
                  /\bnight\b/i.test(lower) ||
                  /at bedtime/i.test(lower);

    // If "once daily" and no specific time mentioned, default to morning
    if (/once daily|OD/i.test(lower) && !morning && !afternoon && !night) {
      // default handled below
    }

    // Refined timing logic
    let m = morning, a = afternoon, n = night;
    if (/twice daily|BD/i.test(lower) && !m && !a && !n) { m = true; n = true; }
    if (/thrice daily|TDS|three times/i.test(lower) && !m && !a && !n) { m = true; a = true; n = true; }
    if (/once daily|OD/i.test(lower) && !m && !a && !n) { m = true; }
    if (/four times|QID/i.test(lower)) { m = true; a = true; n = true; }
    if (/morning\s*(?:&|,|and)\s*night/i.test(lower)) { m = true; n = true; a = false; }
    if (/morning,?\s*afternoon\s*(?:&|,|and)\s*night/i.test(lower)) { m = true; a = true; n = true; }
    // SOS
    if (/\bSOS\b/i.test(lower)) { m = false; a = false; n = false; }

    // Before/After food
    const beforeFood = /before\s*(?:food|meal|breakfast|lunch|dinner)|empty stomach/i.test(lower);
    const afterFood = /after\s*(?:food|meal|breakfast|lunch|dinner)/i.test(lower);

    // Duration
    const durationMatch = line.match(/(?:for\s+)?(\d+\s*(?:days?|weeks?|months?))/i);
    const duration = durationMatch ? durationMatch[1] : "";

    // Extra instructions
    const extras: string[] = [];
    if (/\bSOS\b/i.test(lower)) extras.push("SOS");
    if (/apply locally/i.test(lower)) extras.push("Apply locally");
    const instructions = extras.join(", ");

    const type = detectMedicineType(line);
    return { name: name.replace(/\s+/g, " ").trim(), dosage, morning: m, afternoon: a, night: n, beforeFood, afterFood, duration, instructions, type };
  });
}

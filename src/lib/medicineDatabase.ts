// Common medicines with dosage forms, strengths, and typical dosing
export interface Medicine {
  name: string;
  form: string;
  strengths: string[];
  frequencies: string[];
  instructions: string[];
  timing?: string[]; // morning, evening, night, before/after dinner etc.
}

// Timing options available for all medicines
export const timingOptions = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
  "Morning & Night",
  "Morning, Afternoon & Night",
  "Before food",
  "After food",
  "Before breakfast",
  "After breakfast",
  "Before lunch",
  "After lunch",
  "Before dinner",
  "After dinner",
  "Empty stomach",
  "At bedtime",
  "SOS (as needed)",
];

export const medicineDatabase: Medicine[] = [
  // Analgesics / Antipyretics
  { name: "Paracetamol", form: "Tab", strengths: ["500mg", "650mg"], frequencies: ["twice daily", "thrice daily", "SOS"], instructions: ["after food", ""] },
  { name: "Ibuprofen", form: "Tab", strengths: ["200mg", "400mg", "600mg"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },
  { name: "Diclofenac", form: "Tab", strengths: ["50mg", "100mg"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },
  { name: "Aceclofenac", form: "Tab", strengths: ["100mg"], frequencies: ["twice daily"], instructions: ["after food"] },
  { name: "Tramadol", form: "Tab", strengths: ["50mg", "100mg"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },
  { name: "Aspirin", form: "Tab", strengths: ["75mg", "150mg", "325mg"], frequencies: ["once daily"], instructions: ["after food"] },

  // Antibiotics
  { name: "Amoxicillin", form: "Cap", strengths: ["250mg", "500mg"], frequencies: ["thrice daily", "twice daily"], instructions: ["after food", "for 5 days", "for 7 days"] },
  { name: "Azithromycin", form: "Tab", strengths: ["250mg", "500mg"], frequencies: ["once daily"], instructions: ["after food", "for 3 days", "for 5 days"] },
  { name: "Ciprofloxacin", form: "Tab", strengths: ["250mg", "500mg"], frequencies: ["twice daily"], instructions: ["after food", "for 5 days"] },
  { name: "Levofloxacin", form: "Tab", strengths: ["250mg", "500mg", "750mg"], frequencies: ["once daily"], instructions: ["after food", "for 5 days"] },
  { name: "Metronidazole", form: "Tab", strengths: ["200mg", "400mg"], frequencies: ["thrice daily"], instructions: ["after food", "for 5 days"] },
  { name: "Doxycycline", form: "Cap", strengths: ["100mg"], frequencies: ["twice daily"], instructions: ["after food", "for 7 days"] },
  { name: "Cephalexin", form: "Cap", strengths: ["250mg", "500mg"], frequencies: ["thrice daily", "twice daily"], instructions: ["after food", "for 5 days"] },
  { name: "Cefixime", form: "Tab", strengths: ["200mg", "400mg"], frequencies: ["twice daily", "once daily"], instructions: ["after food", "for 5 days"] },
  { name: "Augmentin", form: "Tab", strengths: ["625mg", "1g"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food", "for 5 days", "for 7 days"] },
  { name: "Clindamycin", form: "Cap", strengths: ["150mg", "300mg"], frequencies: ["thrice daily", "four times daily"], instructions: ["after food", "for 7 days"] },

  // Antacids / GI
  { name: "Pantoprazole", form: "Tab", strengths: ["20mg", "40mg"], frequencies: ["once daily", "twice daily"], instructions: ["before food"] },
  { name: "Omeprazole", form: "Cap", strengths: ["20mg", "40mg"], frequencies: ["once daily"], instructions: ["before food"] },
  { name: "Ranitidine", form: "Tab", strengths: ["150mg", "300mg"], frequencies: ["twice daily"], instructions: ["before food"] },
  { name: "Domperidone", form: "Tab", strengths: ["10mg"], frequencies: ["thrice daily"], instructions: ["before food"] },
  { name: "Ondansetron", form: "Tab", strengths: ["4mg", "8mg"], frequencies: ["twice daily", "thrice daily", "SOS"], instructions: ["before food"] },
  { name: "Sucralfate", form: "Syp", strengths: ["1g/10ml"], frequencies: ["thrice daily", "four times daily"], instructions: ["before food"] },
  { name: "Antacid Gel", form: "Syp", strengths: ["10ml"], frequencies: ["thrice daily", "SOS"], instructions: ["after food"] },

  // Antihistamines / Allergy
  { name: "Cetirizine", form: "Tab", strengths: ["5mg", "10mg"], frequencies: ["once daily"], instructions: ["at bedtime", ""] },
  { name: "Levocetirizine", form: "Tab", strengths: ["5mg"], frequencies: ["once daily"], instructions: ["at bedtime"] },
  { name: "Fexofenadine", form: "Tab", strengths: ["120mg", "180mg"], frequencies: ["once daily"], instructions: [""] },
  { name: "Chlorpheniramine", form: "Tab", strengths: ["4mg"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },
  { name: "Montelukast", form: "Tab", strengths: ["10mg"], frequencies: ["once daily"], instructions: ["at bedtime"] },

  // Cough / Cold
  { name: "Benadryl", form: "Syp", strengths: ["5ml", "10ml"], frequencies: ["thrice daily", "at bedtime"], instructions: [""] },
  { name: "Ambroxol", form: "Syp", strengths: ["5ml", "10ml"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },
  { name: "Dextromethorphan", form: "Syp", strengths: ["5ml", "10ml"], frequencies: ["thrice daily"], instructions: [""] },
  { name: "Guaifenesin", form: "Syp", strengths: ["5ml", "10ml"], frequencies: ["thrice daily"], instructions: ["after food"] },

  // Antidiabetic
  { name: "Metformin", form: "Tab", strengths: ["250mg", "500mg", "850mg", "1000mg"], frequencies: ["once daily", "twice daily"], instructions: ["after food"] },
  { name: "Glimepiride", form: "Tab", strengths: ["1mg", "2mg", "4mg"], frequencies: ["once daily"], instructions: ["before food"] },
  { name: "Glipizide", form: "Tab", strengths: ["5mg", "10mg"], frequencies: ["once daily", "twice daily"], instructions: ["before food"] },

  // Antihypertensives
  { name: "Amlodipine", form: "Tab", strengths: ["2.5mg", "5mg", "10mg"], frequencies: ["once daily"], instructions: [""] },
  { name: "Telmisartan", form: "Tab", strengths: ["20mg", "40mg", "80mg"], frequencies: ["once daily"], instructions: [""] },
  { name: "Losartan", form: "Tab", strengths: ["25mg", "50mg", "100mg"], frequencies: ["once daily"], instructions: [""] },
  { name: "Enalapril", form: "Tab", strengths: ["2.5mg", "5mg", "10mg"], frequencies: ["once daily", "twice daily"], instructions: [""] },
  { name: "Atenolol", form: "Tab", strengths: ["25mg", "50mg", "100mg"], frequencies: ["once daily"], instructions: [""] },
  { name: "Metoprolol", form: "Tab", strengths: ["25mg", "50mg", "100mg"], frequencies: ["once daily", "twice daily"], instructions: [""] },
  { name: "Hydrochlorothiazide", form: "Tab", strengths: ["12.5mg", "25mg"], frequencies: ["once daily"], instructions: ["in the morning"] },

  // Steroids / Anti-inflammatory
  { name: "Prednisolone", form: "Tab", strengths: ["5mg", "10mg", "20mg", "40mg"], frequencies: ["once daily", "twice daily"], instructions: ["after food", "in the morning"] },
  { name: "Dexamethasone", form: "Tab", strengths: ["0.5mg", "4mg"], frequencies: ["once daily", "twice daily"], instructions: ["after food"] },
  { name: "Methylprednisolone", form: "Tab", strengths: ["4mg", "8mg", "16mg"], frequencies: ["once daily"], instructions: ["after food"] },

  // Vitamins / Supplements
  { name: "Vitamin D3", form: "Tab", strengths: ["1000 IU", "60000 IU"], frequencies: ["once daily", "once weekly"], instructions: ["after food"] },
  { name: "Vitamin B Complex", form: "Tab", strengths: [""], frequencies: ["once daily"], instructions: ["after food"] },
  { name: "Calcium + Vitamin D", form: "Tab", strengths: ["500mg"], frequencies: ["once daily", "twice daily"], instructions: ["after food"] },
  { name: "Iron + Folic Acid", form: "Tab", strengths: [""], frequencies: ["once daily"], instructions: ["after food"] },
  { name: "Multivitamin", form: "Tab", strengths: [""], frequencies: ["once daily"], instructions: ["after food"] },

  // Muscle relaxants
  { name: "Thiocolchicoside", form: "Tab", strengths: ["4mg", "8mg"], frequencies: ["twice daily"], instructions: ["after food"] },
  { name: "Chlorzoxazone", form: "Tab", strengths: ["250mg", "500mg"], frequencies: ["twice daily", "thrice daily"], instructions: ["after food"] },

  // Respiratory
  { name: "Salbutamol", form: "Inhaler", strengths: ["100mcg", "200mcg"], frequencies: ["SOS", "twice daily"], instructions: [""] },
  { name: "Budesonide", form: "Inhaler", strengths: ["100mcg", "200mcg", "400mcg"], frequencies: ["twice daily"], instructions: [""] },
  { name: "Deriphyllin", form: "Tab", strengths: ["150mg"], frequencies: ["twice daily"], instructions: ["after food"] },

  // Topical
  { name: "Betadine", form: "Ointment", strengths: ["5%"], frequencies: ["twice daily", "thrice daily"], instructions: ["apply locally"] },
  { name: "Mupirocin", form: "Ointment", strengths: ["2%"], frequencies: ["twice daily", "thrice daily"], instructions: ["apply locally", "for 5 days"] },
  { name: "Clotrimazole", form: "Cream", strengths: ["1%"], frequencies: ["twice daily"], instructions: ["apply locally", "for 2 weeks"] },
  { name: "Diclofenac Gel", form: "Gel", strengths: ["1%"], frequencies: ["twice daily", "thrice daily"], instructions: ["apply locally"] },

  // Eye / Ear drops
  { name: "Ciprofloxacin Eye Drops", form: "E/D", strengths: ["0.3%"], frequencies: ["four times daily", "every 4 hours"], instructions: ["for 5 days"] },
  { name: "Tobramycin Eye Drops", form: "E/D", strengths: ["0.3%"], frequencies: ["four times daily"], instructions: ["for 5 days"] },
  { name: "Artificial Tears", form: "E/D", strengths: [""], frequencies: ["four times daily", "SOS"], instructions: [""] },
];

export function searchMedicines(query: string): Medicine[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return medicineDatabase
    .filter(m => m.name.toLowerCase().includes(lower))
    .slice(0, 8);
}

export function formatMedicineLine(med: Medicine, strengthIdx = 0, freqIdx = 0, instrIdx = 0, timing?: string): string {
  const parts = [`${med.form} ${med.name}`];
  if (med.strengths[strengthIdx]) parts.push(med.strengths[strengthIdx]);
  parts.push(med.frequencies[freqIdx]);
  if (med.instructions[instrIdx]) parts.push(med.instructions[instrIdx]);
  if (timing) parts.push(`— ${timing}`);
  return parts.join(" ");
}

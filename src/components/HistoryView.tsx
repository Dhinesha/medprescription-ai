import { Search, Trash2, FileText, Calendar, Building2 } from "lucide-react";
import { useState } from "react";
import { deletePrescription } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PrescriptionRecord {
  id: string;
  patient_name: string;
  age: string | null;
  gender: string | null;
  visit_date: string;
  prescription_text: string | null;
  created_at: string;
  hospital_templates: {
    hospital_name: string;
    doctor_name: string;
  } | null;
}

interface HistoryViewProps {
  prescriptions: PrescriptionRecord[];
  onRefresh: () => void;
}

export default function HistoryView({ prescriptions, onRefresh }: HistoryViewProps) {
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter(r =>
    r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.prescription_text?.toLowerCase().includes(search.toLowerCase()) ||
    r.visit_date?.includes(search)
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePrescription(id);
      onRefresh();
      toast.success("Record deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-medical-blue" />
          Prescription History
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, date..."
            className="bg-card rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring card-shadow w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl card-shadow p-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{prescriptions.length === 0 ? "No prescriptions saved yet." : "No matching records found."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl card-shadow p-5 hover:card-shadow-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{r.patient_name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {r.age && <span>{r.age} yrs</span>}
                    {r.gender && <span>• {r.gender}</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {r.visit_date}
                    </span>
                  </div>
                  {r.hospital_templates && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      {r.hospital_templates.hospital_name} • Dr. {r.hospital_templates.doctor_name}
                    </div>
                  )}
                  {r.prescription_text && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.prescription_text}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Search, Trash2, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import type { MedicalReport } from "@/types/medical";
import { motion } from "framer-motion";

interface PatientRecordsProps {
  reports: MedicalReport[];
  onDelete: (id: string) => void;
  onSelect: (report: MedicalReport) => void;
}

export default function PatientRecords({ reports, onDelete, onSelect }: PatientRecordsProps) {
  const [search, setSearch] = useState("");

  const filtered = reports.filter(r =>
    r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
    r.createdAt?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-medical-blue" />
          Patient Records
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, diagnosis, date..."
            className="bg-card rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring card-shadow w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl card-shadow p-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{reports.length === 0 ? "No reports saved yet." : "No matching records found."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(r)}
              className="bg-card rounded-2xl card-shadow p-5 cursor-pointer hover:card-shadow-hover transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{r.patientName || "Unnamed Patient"}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{r.age} • {r.gender}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.diagnosis && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{r.diagnosis}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(r.id); }}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive ml-4"
                >
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

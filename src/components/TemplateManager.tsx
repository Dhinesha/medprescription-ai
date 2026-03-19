import { Building2, Plus, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { HospitalTemplate } from "@/types/medical";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateManagerProps {
  templates: HospitalTemplate[];
  activeTemplate: HospitalTemplate | null;
  onSave: (template: HospitalTemplate) => void;
  onDelete: (id: string) => void;
  onSelect: (template: HospitalTemplate) => void;
}

const emptyTemplate: Omit<HospitalTemplate, "id"> = {
  hospitalName: "", address: "", phone: "", doctorName: "", department: "", registrationNumber: "",
};

const fields: { key: keyof Omit<HospitalTemplate, "id">; label: string; placeholder: string }[] = [
  { key: "hospitalName", label: "Hospital Name", placeholder: "e.g. City General Hospital" },
  { key: "address", label: "Address", placeholder: "e.g. 123 Medical Lane, Chennai" },
  { key: "phone", label: "Phone Number", placeholder: "e.g. +91 98765 43210" },
  { key: "doctorName", label: "Doctor Name", placeholder: "e.g. Dr. Rajesh Kumar" },
  { key: "department", label: "Department", placeholder: "e.g. General Medicine" },
  { key: "registrationNumber", label: "Registration Number", placeholder: "e.g. MCI-12345" },
];

export default function TemplateManager({ templates, activeTemplate, onSave, onDelete, onSelect }: TemplateManagerProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Omit<HospitalTemplate, "id">>(emptyTemplate);
  const [editId, setEditId] = useState<string | null>(null);

  const handleNew = () => {
    setForm(emptyTemplate);
    setEditId(null);
    setEditing(true);
  };

  const handleEdit = (t: HospitalTemplate) => {
    const { id, ...rest } = t;
    setForm(rest);
    setEditId(id);
    setEditing(true);
  };

  const handleSave = () => {
    const template: HospitalTemplate = { ...form, id: editId || crypto.randomUUID() };
    onSave(template);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-medical-blue" />
          Hospital Templates
        </h2>
        <Button onClick={handleNew} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> New Template
        </Button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-2xl card-shadow p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">
              {editId ? "Edit Template" : "New Template"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} className="bg-medical-teal text-primary-foreground">
                <Check className="w-4 h-4 mr-1" /> Save Template
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {templates.length === 0 && !editing ? (
        <div className="bg-card rounded-2xl card-shadow p-12 text-center text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map(t => (
            <motion.div
              key={t.id}
              layout
              className={`bg-card rounded-2xl card-shadow p-5 cursor-pointer transition-all hover:card-shadow-hover ${
                activeTemplate?.id === t.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelect(t)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{t.hospitalName}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.address}</p>
                  <p className="text-xs text-muted-foreground">Dr. {t.doctorName} • {t.department}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs">
                    Edit
                  </button>
                  <button onClick={e => { e.stopPropagation(); onDelete(t.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {activeTemplate?.id === t.id && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

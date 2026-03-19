import { Building2, Plus, Upload, Trash2, Check, Image } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { HospitalTemplate } from "@/types/medical";
import { createTemplate, updateTemplate, deleteTemplate, uploadLogo } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateStepProps {
  templates: HospitalTemplate[];
  selectedTemplate: HospitalTemplate | null;
  onSelect: (t: HospitalTemplate) => void;
  onRefresh: () => void;
  onNext: () => void;
}

const fields: { key: string; label: string; placeholder: string; required?: boolean }[] = [
  { key: "hospital_name", label: "Hospital Name", placeholder: "e.g. City General Hospital", required: true },
  { key: "address", label: "Address", placeholder: "e.g. 123 Medical Lane, Chennai" },
  { key: "phone", label: "Phone Number", placeholder: "e.g. +91 98765 43210" },
  { key: "doctor_name", label: "Doctor Name", placeholder: "e.g. Dr. Rajesh Kumar", required: true },
  { key: "department", label: "Department", placeholder: "e.g. General Medicine" },
  { key: "registration_number", label: "Registration Number", placeholder: "e.g. MCI-12345" },
];

export default function TemplateStep({ templates, selectedTemplate, onSelect, onRefresh, onNext }: TemplateStepProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    setForm({});
    setEditId(null);
    setLogoFile(null);
    setLogoPreview(null);
    setEditing(true);
  };

  const handleEdit = (t: HospitalTemplate) => {
    setForm({
      hospital_name: t.hospital_name,
      address: t.address || "",
      phone: t.phone || "",
      doctor_name: t.doctor_name,
      department: t.department || "",
      registration_number: t.registration_number || "",
    });
    setEditId(t.id);
    setLogoPreview(t.logo_url);
    setLogoFile(null);
    setEditing(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.hospital_name || !form.doctor_name) {
      toast.error("Hospital name and doctor name are required");
      return;
    }
    setSaving(true);
    try {
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const payload = {
        hospital_name: form.hospital_name,
        address: form.address || null,
        phone: form.phone || null,
        doctor_name: form.doctor_name,
        department: form.department || null,
        registration_number: form.registration_number || null,
        logo_url: logoUrl || null,
      };

      if (editId) {
        const updated = await updateTemplate(editId, payload);
        onSelect(updated);
      } else {
        const created = await createTemplate(payload);
        onSelect(created);
      }
      setEditing(false);
      onRefresh();
      toast.success("Template saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      onRefresh();
      toast.success("Template deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-medical-blue" />
          Select Hospital Template
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
            <h3 className="font-semibold text-foreground mb-4">{editId ? "Edit Template" : "New Template"}</h3>

            {/* Logo upload */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Hospital Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl bg-muted p-1" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-1" /> Upload Logo
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    value={form[f.key] || ""}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-medical-teal text-primary-foreground">
                <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Template"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {templates.length === 0 && !editing ? (
        <div className="bg-card rounded-2xl card-shadow p-12 text-center text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">No templates yet</p>
          <p className="text-sm mt-1">Create a hospital template to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map(t => (
            <motion.div
              key={t.id}
              layout
              className={`bg-card rounded-2xl card-shadow p-5 cursor-pointer transition-all hover:card-shadow-hover ${
                selectedTemplate?.id === t.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelect(t)}
            >
              <div className="flex items-start gap-3">
                {t.logo_url ? (
                  <img src={t.logo_url} alt="" className="w-12 h-12 object-contain rounded-lg bg-muted p-1" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-medical-blue-light flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-medical-blue" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{t.hospital_name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Dr. {t.doctor_name}</p>
                  {t.department && <p className="text-xs text-muted-foreground">{t.department}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs">Edit</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {selectedTemplate?.id === t.id && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Selected</span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <Button onClick={onNext} className="w-full h-14 text-base font-semibold medical-gradient text-primary-foreground hover:opacity-90 rounded-xl">
          Continue with {selectedTemplate.hospital_name} →
        </Button>
      )}
    </div>
  );
}

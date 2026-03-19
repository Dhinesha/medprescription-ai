import { Printer, Download, Save, Share2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { HospitalTemplate, PatientInfo } from "@/types/medical";
import { savePrescription } from "@/lib/api";

interface PreviewStepProps {
  template: HospitalTemplate;
  patient: PatientInfo;
  prescriptionText: string;
  onPrescriptionChange: (text: string) => void;
  onBack: () => void;
  onReset: () => void;
}

export default function PreviewStep({ template, patient, prescriptionText, onPrescriptionChange, onBack, onReset }: PreviewStepProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`prescription_${patient.patientName.replace(/\s+/g, "_")}_${patient.visitDate}.pdf`);
    toast.success("PDF downloaded!");
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription - ${patient.patientName}`,
          text: `Prescription for ${patient.patientName}\n\n${prescriptionText}`,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`Prescription for ${patient.patientName}\n\nDate: ${patient.visitDate}\nAge: ${patient.age} | Gender: ${patient.gender}\n\n${prescriptionText}\n\nDr. ${template.doctor_name}\n${template.hospital_name}`);
      toast.success("Prescription copied to clipboard!");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePrescription({
        template_id: template.id,
        patient_name: patient.patientName,
        age: patient.age || null,
        gender: patient.gender || null,
        visit_date: patient.visitDate,
        prescription_text: prescriptionText,
        raw_transcript: prescriptionText,
        notes: null,
      });
      setSaved(true);
      toast.success("Prescription saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Parse prescription lines for display
  const rxLines = prescriptionText.split(/[.\n]/).map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Edit</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={handleShare}><Share2 className="w-4 h-4 mr-1" /> Share</Button>
        <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
        <Button variant="outline" onClick={handlePDF}><Download className="w-4 h-4 mr-1" /> PDF</Button>
        <Button onClick={handleSave} disabled={saving || saved} className="bg-medical-teal text-primary-foreground">
          {saved ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</> : <><Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}</>}
        </Button>
      </div>

      {/* Prescription preview */}
      <div ref={previewRef} className="bg-card rounded-2xl card-shadow p-8 sm:p-10 max-w-2xl mx-auto">
        {/* Hospital header */}
        <div className="text-center border-b-2 border-primary pb-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {template.logo_url && (
              <img src={template.logo_url} alt="" className="w-14 h-14 object-contain" />
            )}
            <div>
              <h3 className="text-xl font-bold text-primary">{template.hospital_name}</h3>
              {template.address && <p className="text-xs text-muted-foreground">{template.address}</p>}
            </div>
          </div>
          {template.phone && <p className="text-xs text-muted-foreground">Phone: {template.phone}</p>}
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Dr. {template.doctor_name}{template.department ? ` • ${template.department}` : ""}</span>
            {template.registration_number && <span>Reg: {template.registration_number}</span>}
          </div>
        </div>

        {/* Patient info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/50 rounded-xl p-4 mb-6 text-sm">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Patient</span>
            <p className="font-semibold text-foreground">{patient.patientName}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Age</span>
            <p className="font-semibold text-foreground">{patient.age || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Gender</span>
            <p className="font-semibold text-foreground">{patient.gender || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Date</span>
            <p className="font-semibold text-foreground">{patient.visitDate}</p>
          </div>
        </div>

        {/* Rx symbol */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">℞</span>
        </div>

        {/* Prescription content - editable */}
        <div className="space-y-2 mb-8">
          {rxLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">{i + 1}.</span>
              <p className="text-foreground leading-relaxed">{line}</p>
            </div>
          ))}
        </div>

        {/* Editable raw text - no-print */}
        <div className="no-print mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Edit prescription text:</label>
          <textarea
            value={prescriptionText}
            onChange={e => onPrescriptionChange(e.target.value)}
            rows={4}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        {/* Doctor signature */}
        <div className="pt-8 mt-8 border-t border-border text-right">
          <p className="text-sm font-semibold text-foreground">Dr. {template.doctor_name}</p>
          {template.department && <p className="text-xs text-muted-foreground">{template.department}</p>}
          {template.registration_number && <p className="text-xs text-muted-foreground">Reg: {template.registration_number}</p>}
        </div>
      </div>

      {/* New prescription button */}
      {saved && (
        <div className="flex justify-center no-print">
          <Button onClick={onReset} className="h-14 px-8 text-base font-semibold medical-gradient text-primary-foreground hover:opacity-90 rounded-xl">
            + New Prescription
          </Button>
        </div>
      )}
    </div>
  );
}

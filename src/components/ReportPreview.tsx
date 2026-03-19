import { Printer, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MedicalReport, HospitalTemplate } from "@/types/medical";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportPreviewProps {
  report: Partial<MedicalReport>;
  template: HospitalTemplate | null;
  onSave: () => void;
  isSaving?: boolean;
}

export default function ReportPreview({ report, template, onSave, isSaving }: ReportPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`report_${report.patientName || "patient"}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handlePrint = () => window.print();

  const hasContent = report.patientName || report.diagnosis || report.symptoms;

  return (
    <div className="bg-card rounded-2xl card-shadow">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Report Preview</h2>
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={!hasContent}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={!hasContent}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button size="sm" onClick={onSave} disabled={!hasContent || isSaving} className="bg-medical-teal hover:bg-medical-teal/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </div>

      <div ref={previewRef} className="p-8 bg-card">
        {/* Hospital Header */}
        {template && (
          <div className="text-center border-b-2 border-primary pb-4 mb-6">
            <h3 className="text-xl font-bold text-primary">{template.hospitalName}</h3>
            <p className="text-xs text-muted-foreground mt-1">{template.address}</p>
            <p className="text-xs text-muted-foreground">Phone: {template.phone}</p>
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>Dr. {template.doctorName} • {template.department}</span>
              <span>Reg: {template.registrationNumber}</span>
            </div>
          </div>
        )}

        {!hasContent ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No report data yet</p>
            <p className="text-sm mt-1">Use voice input or fill the form to generate a report</p>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-xl p-4">
              <Field label="Patient" value={report.patientName} />
              <Field label="Age" value={report.age} />
              <Field label="Gender" value={report.gender} />
            </div>

            <Section title="Chief Complaint" value={report.chiefComplaint} />
            <Section title="Symptoms" value={report.symptoms} />
            <Section title="Diagnosis" value={report.diagnosis} />
            <Section title="Prescription" value={report.prescription} />
            <Section title="Doctor's Advice" value={report.doctorAdvice} />

            {report.followUpDate && (
              <div className="bg-medical-blue-light rounded-xl p-4">
                <span className="text-xs font-medium text-medical-blue">Follow-up Date:</span>
                <span className="ml-2 text-sm text-foreground">{report.followUpDate}</span>
              </div>
            )}

            {template && (
              <div className="pt-8 mt-8 border-t border-border text-right">
                <p className="text-sm font-medium text-foreground">Dr. {template.doctorName}</p>
                <p className="text-xs text-muted-foreground">{template.department}</p>
                <p className="text-xs text-muted-foreground">Reg: {template.registrationNumber}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className="text-foreground font-medium">{value || "—"}</p>
    </div>
  );
}

function Section({ title, value }: { title: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{title}</h4>
      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

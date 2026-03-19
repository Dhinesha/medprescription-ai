import { Check, X, Sun, Cloud, Moon } from "lucide-react";
import type { PrescriptionRow } from "@/lib/prescriptionParser";

interface PrescriptionTableProps {
  rows: PrescriptionRow[];
}

export default function PrescriptionTable({ rows }: PrescriptionTableProps) {
  if (rows.length === 0) return null;

  const Tick = () => <Check className="w-4 h-4 text-medical-teal mx-auto" />;
  const Dash = () => <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-primary/10">
            <th className="text-left py-2.5 px-3 font-semibold text-primary border border-primary/20 w-8">
              #
            </th>
            <th className="text-left py-2.5 px-3 font-semibold text-primary border border-primary/20">
              Medicine
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-20">
              Dosage
            </th>
            <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-16">
              <div className="flex flex-col items-center gap-0.5">
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[10px]">Morn</span>
              </div>
            </th>
            <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-16">
              <div className="flex flex-col items-center gap-0.5">
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-[10px]">Noon</span>
              </div>
            </th>
            <th className="text-center py-2.5 px-2 font-semibold text-primary border border-primary/20 w-16">
              <div className="flex flex-col items-center gap-0.5">
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[10px]">Night</span>
              </div>
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-24">
              Food
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-primary border border-primary/20 w-20">
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
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
              <td className="py-2.5 px-3 border border-border text-center">
                {row.beforeFood && row.afterFood ? (
                  <span className="text-xs text-foreground">Before & After</span>
                ) : row.beforeFood ? (
                  <span className="text-xs font-medium text-medical-orange">Before Food</span>
                ) : row.afterFood ? (
                  <span className="text-xs font-medium text-medical-teal">After Food</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-2.5 px-3 border border-border text-center text-xs text-foreground">
                {row.duration || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

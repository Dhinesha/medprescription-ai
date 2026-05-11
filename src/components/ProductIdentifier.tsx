import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Loader2, Pill, AlertTriangle, Info, Clock, Users, IndianRupee, Package, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductInfo {
  brand?: string;
  genericName?: string;
  manufacturer?: string;
  productType?: string;
  strength?: string;
  packSize?: string;
  mrp?: string;
  batch?: string;
  mfgDate?: string;
  expDate?: string;
  uses?: string[];
  ageWiseDosage?: { ageGroup: string; dose: string }[];
  timeForUse?: string;
  duration?: string;
  sideEffects?: string[];
  warnings?: string[];
  storage?: string;
  disclaimer?: string;
  error?: string;
}

export default function ProductIdentifier() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<ProductInfo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image too large (max 10MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result as string); setInfo(null); };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const base64 = imagePreview.split(",")[1];
      const { data, error } = await supabase.functions.invoke("med-assistant", {
        body: { type: "identify_product", image_base64: base64 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      let raw = (data?.result || "").trim();
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(raw) as ProductInfo;
      setInfo(parsed);
      if (parsed.error) toast.error(parsed.error);
      else toast.success("Product identified");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to analyze product");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImagePreview(null); setInfo(null); };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
          <Pill className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Smart Med Product ID</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload or snap a tablet, syrup or any medical product to get brand, age-wise dosage, timing & MRP.
        </p>
      </div>

      {!imagePreview ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="group p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3"
          >
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium text-foreground">Upload Image</span>
            <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="group p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3"
          >
            <Camera className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium text-foreground">Take Photo</span>
            <span className="text-xs text-muted-foreground">Use device camera</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
            <img src={imagePreview} alt="Product" className="w-full max-h-72 object-contain" />
            <button
              onClick={reset}
              className="absolute top-2 right-2 p-2 rounded-lg bg-background/90 hover:bg-background border border-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {!info && (
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analyzing product...</>) : "Identify Product"}
            </button>
          )}
        </motion.div>
      )}

      {info && !info.error && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xl font-bold text-foreground">{info.brand || "Unknown Brand"}</h3>
                {info.genericName && <p className="text-sm text-muted-foreground mt-0.5">{info.genericName}</p>}
                {info.manufacturer && <p className="text-xs text-muted-foreground mt-1">By {info.manufacturer}</p>}
              </div>
              {info.mrp && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <IndianRupee className="w-5 h-5" />
                    {info.mrp.replace(/₹|INR|Rs\.?/gi, "").trim()}
                  </div>
                  <p className="text-xs text-muted-foreground">MRP</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {info.productType && <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">{info.productType}</span>}
              {info.strength && <span className="px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-medium">{info.strength}</span>}
              {info.packSize && <span className="px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-medium"><Package className="w-3 h-3 inline mr-1" />{info.packSize}</span>}
            </div>
          </div>

          {/* Uses */}
          {info.uses && info.uses.length > 0 && (
            <Section icon={<Info className="w-4 h-4" />} title="Uses">
              <ul className="space-y-1.5">
                {info.uses.map((u, i) => <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-primary">•</span>{u}</li>)}
              </ul>
            </Section>
          )}

          {/* Age-wise dosage */}
          {info.ageWiseDosage && info.ageWiseDosage.length > 0 && (
            <Section icon={<Users className="w-4 h-4" />} title="Age-wise Dosage">
              <div className="divide-y divide-border">
                {info.ageWiseDosage.map((d, i) => (
                  <div key={i} className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-foreground">{d.ageGroup}</span>
                    <span className="text-sm text-muted-foreground text-right">{d.dose}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Timing */}
          {(info.timeForUse || info.duration) && (
            <Section icon={<Clock className="w-4 h-4" />} title="When & How">
              {info.timeForUse && <p className="text-sm text-foreground"><strong>Timing:</strong> {info.timeForUse}</p>}
              {info.duration && <p className="text-sm text-foreground mt-1"><strong>Duration:</strong> {info.duration}</p>}
            </Section>
          )}

          {/* Side effects */}
          {info.sideEffects && info.sideEffects.length > 0 && (
            <Section icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} title="Possible Side Effects">
              <div className="flex flex-wrap gap-1.5">
                {info.sideEffects.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">{s}</span>)}
              </div>
            </Section>
          )}

          {/* Warnings */}
          {info.warnings && info.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-sm text-destructive">Warnings</h4>
              </div>
              <ul className="space-y-1">
                {info.warnings.map((w, i) => <li key={i} className="text-xs text-foreground flex gap-2"><span>⚠️</span>{w}</li>)}
              </ul>
            </div>
          )}

          {/* Meta */}
          {(info.batch || info.mfgDate || info.expDate || info.storage) && (
            <Section title="Product Details">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {info.batch && <Meta k="Batch" v={info.batch} />}
                {info.mfgDate && <Meta k="Mfg Date" v={info.mfgDate} />}
                {info.expDate && <Meta k="Exp Date" v={info.expDate} />}
                {info.storage && <Meta k="Storage" v={info.storage} />}
              </div>
            </Section>
          )}

          {info.disclaimer && (
            <p className="text-xs text-muted-foreground italic text-center px-4">{info.disclaimer}</p>
          )}

          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">
            Scan Another Product
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-2 rounded-lg bg-muted">
      <div className="text-muted-foreground">{k}</div>
      <div className="font-medium text-foreground">{v}</div>
    </div>
  );
}

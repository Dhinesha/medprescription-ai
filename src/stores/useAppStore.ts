import { useState, useCallback } from "react";
import type { HospitalTemplate, MedicalReport } from "@/types/medical";

const TEMPLATES_KEY = "medvoice_templates";
const REPORTS_KEY = "medvoice_reports";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useAppStore() {
  const [templates, setTemplates] = useState<HospitalTemplate[]>(() => loadFromStorage(TEMPLATES_KEY, []));
  const [reports, setReports] = useState<MedicalReport[]>(() => loadFromStorage(REPORTS_KEY, []));
  const [activeTemplate, setActiveTemplate] = useState<HospitalTemplate | null>(() => templates[0] || null);

  const saveTemplate = useCallback((template: HospitalTemplate) => {
    setTemplates(prev => {
      const exists = prev.findIndex(t => t.id === template.id);
      const next = exists >= 0 ? prev.map(t => t.id === template.id ? template : t) : [...prev, template];
      saveToStorage(TEMPLATES_KEY, next);
      return next;
    });
    setActiveTemplate(template);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToStorage(TEMPLATES_KEY, next);
      return next;
    });
    setActiveTemplate(prev => prev?.id === id ? null : prev);
  }, []);

  const saveReport = useCallback((report: MedicalReport) => {
    setReports(prev => {
      const next = [report, ...prev];
      saveToStorage(REPORTS_KEY, next);
      return next;
    });
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => {
      const next = prev.filter(r => r.id !== id);
      saveToStorage(REPORTS_KEY, next);
      return next;
    });
  }, []);

  return { templates, reports, activeTemplate, setActiveTemplate, saveTemplate, deleteTemplate, saveReport, deleteReport };
}

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIFormatButtonProps {
  transcript: string;
  isProcessing: boolean;
  onFormat: () => void;
}

export default function AIFormatButton({ transcript, isProcessing, onFormat }: AIFormatButtonProps) {
  return (
    <Button
      onClick={onFormat}
      disabled={!transcript.trim() || isProcessing}
      className="w-full h-14 text-base font-semibold medical-gradient text-primary-foreground hover:opacity-90 rounded-xl"
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {isProcessing ? "Processing with AI..." : "Generate Report with AI"}
    </Button>
  );
}

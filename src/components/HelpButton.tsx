// HelpButton.tsx
import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function HelpButton() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("hasSeenHelp");
    if (!hasSeenHelp) {
      setOpen(true);
      localStorage.setItem("hasSeenHelp", "true");
    }
  }, []);

  return (
    <>
      <Button
        variant="default"
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-md"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>About This App</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>🚀 This app lets you chat with multiple AI providers (OpenAI, Gemini, Grok) in one place.</p>
            <p>✨ It automatically detects the domain of your query (programming, finance, health, etc.) and chooses the best providers.</p>
            <p>⭐ You can rate AI responses. The app learns over time and prioritizes better providers for your domain.</p>
            <p>📊 Feedback updates provider performance stats per domain.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

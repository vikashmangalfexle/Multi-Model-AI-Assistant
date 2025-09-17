import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIResponse } from "./ChatInterface";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface ResponseCardProps {
  response: AIResponse;
  onRate: (rating: number) => void;
}

const modelConfig = {
  openai: {
    name: "OpenAI GPT-4",
    color: "text-ai-openai",
    bgColor: "bg-ai-openai/10",
    borderColor: "border-ai-openai/30",
  },
  gemini: {
    name: "Google Gemini",
    color: "text-ai-gemini",
    bgColor: "bg-ai-gemini/10",
    borderColor: "border-ai-gemini/30",
  },
  grok: {
    name: "Grok",
    color: "text-ai-deepseek",
    bgColor: "bg-ai-deepseek/10",
    borderColor: "border-ai-deepseek/30",
  },
  github: {
    name: "GitHub Copilot",
    color: "text-ai-github",
    bgColor: "bg-ai-github/10",
    borderColor: "border-ai-github/30",
  },
  claude: {
    name: "Claude 3",
    color: "text-ai-claude",
    bgColor: "bg-ai-claude/10",
    borderColor: "border-ai-claude/30",
  },
};

export function ResponseCard({ response, onRate }: ResponseCardProps) {
  const config = modelConfig[response.model];
  const rating = response.rating || 0;

  // if (response.isLoading) {
  //   return (
  //     <Card
  //       className={cn(
  //         "p-4 bg-card/50 backdrop-blur-glass border-2",
  //         config?.borderColor
  //       )}
  //     >
  //       <div className="flex items-center justify-between mb-3">
  //         <Badge className={cn(config?.bgColor, config?.color, "border-0")}>
  //           {config?.name}
  //         </Badge>
  //       </div>
  //       <div className="flex items-center justify-center py-8">
  //         <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  //       </div>
  //     </Card>
  //   );
  // }

  if (response.error) {
    return (
      <Card className="p-4 bg-destructive/5 border-2 border-destructive/30">
        <div className="flex items-center justify-between mb-3">
          <Badge className={cn(config?.bgColor, config?.color, "border-0")}>
            {config?.name}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{response.error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-4 bg-card/50 backdrop-blur-glass border-2 transition-all hover:shadow-lg hover:bg-card-hover",
        config?.borderColor
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          className={cn(
            config?.bgColor,
            config?.color,
            "border-0 font-semibold"
          )}
        >
          {config?.name}
        </Badge>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className="p-0 w-6 h-6 hover:bg-transparent"
              onClick={() => onRate(star)}
            >
              <Star
                className={cn(
                  "w-4 h-4 transition-colors",
                  star <= rating
                    ? "fill-rating-gold text-rating-gold"
                    : "text-rating-silver hover:text-rating-gold"
                )}
              />
            </Button>
          ))}
        </div>
      </div>

      {/* Response content (Markdown with color support) */}
      <div
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:text-foreground",
          "prose-p:text-foreground",
          "prose-strong:text-primary",
          "prose-a:text-primary hover:prose-a:underline",
          "prose-code:text-accent-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:p-3 prose-pre:rounded-lg",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:text-muted-foreground",
          "prose-li:marker:text-primary",
          "dark:prose-invert" // ✅ auto color inversion for dark mode
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {response.content}
        </ReactMarkdown>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          {response.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </Card>
  );
}

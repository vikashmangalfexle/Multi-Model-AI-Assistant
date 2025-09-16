import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  TrendingUp, 
  Heart, 
  GraduationCap, 
  Palette, 
  Globe 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainIndicatorProps {
  domain: string;
  className?: string;
}

const domainConfig = {
  programming: {
    icon: Code2,
    label: "Programming",
    color: "text-blue-500",
    bgColor: "bg-gray-100/10",
  },
  finance: {
    icon: TrendingUp,
    label: "Finance",
    color: "text-green-500",
    bgColor: "bg-gray-500/10",
  },
  health: {
    icon: Heart,
    label: "Health",
    color: "text-red-500",
    bgColor: "bg-gray-500/10",
  },
  education: {
    icon: GraduationCap,
    label: "Education",
    color: "text-purple-500",
    bgColor: "bg-gray-500/10",
  },
  creative: {
    icon: Palette,
    label: "Creative",
    color: "text-orange-500",
    bgColor: "bg-gray-500/10",
  },
  general: {
    icon: Globe,
    label: "General",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
};

export function DomainIndicator({ domain, className }: DomainIndicatorProps) {
  const config = domainConfig[domain as keyof typeof domainConfig] || domainConfig.general;
  const Icon = config.icon;

  return (
    <Badge 
    variant="secondary"
      className={cn(
        "gap-1.5 border-0 text-sm font-medium",
        "bg-primary-glow text-primary-foreground",
        // config.color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

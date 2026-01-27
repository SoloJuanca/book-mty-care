import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  duration: string;
}

export function ServiceCard({ title, description, icon: Icon, href, duration }: ServiceCardProps) {
  return (
    <Link
      to={href}
      className="group block p-6 rounded-xl bg-card border border-border card-elevated"
    >
      <div className="h-12 w-12 rounded-lg hero-gradient flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {duration}
        </span>
        <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver más <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

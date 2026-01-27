import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  location: string;
  text: string;
  rating: number;
}

export function TestimonialCard({ name, location, text, rating }: TestimonialCardProps) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border card-elevated">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-muted"}`}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed italic">
        "{text}"
      </p>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
    </div>
  );
}

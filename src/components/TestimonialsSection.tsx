import { TestimonialCard } from "@/components/TestimonialCard";
import { useApprovedReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback testimonials for when there are no reviews yet
const fallbackTestimonials = [
  {
    id: "fallback-1",
    client_name: "María García",
    client_location: "San Pedro Garza García",
    review_text: "Después de mi cirugía de rodilla, la rehabilitación fue fundamental para mi recuperación. El equipo es muy profesional y atento.",
    rating: 5,
  },
  {
    id: "fallback-2",
    client_name: "Carlos Rodríguez",
    client_location: "Monterrey Centro",
    review_text: "Llevaba años con dolor de espalda. Con las sesiones de quiropraxia finalmente encontré alivio. Totalmente recomendado.",
    rating: 5,
  },
  {
    id: "fallback-3",
    client_name: "Ana Martínez",
    client_location: "Guadalupe, N.L.",
    review_text: "Los masajes descontracturantes son excelentes. El ambiente es muy relajante y el terapeuta muy profesional. Volveré pronto.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { data: reviews, isLoading } = useApprovedReviews(6);

  const displayReviews = reviews && reviews.length > 0 
    ? reviews.map(review => ({
        id: review.id,
        client_name: review.client_name,
        client_location: review.client_location || "",
        review_text: review.review_text,
        rating: review.rating,
      }))
    : fallbackTestimonials;

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              La satisfacción de nuestros pacientes es nuestra mejor carta de presentación.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-4 rounded" />
                  ))}
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Lo que dicen nuestros pacientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La satisfacción de nuestros pacientes es nuestra mejor carta de presentación.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {displayReviews.slice(0, 3).map((review) => (
            <TestimonialCard
              key={review.id}
              name={review.client_name}
              location={review.client_location}
              text={review.review_text}
              rating={review.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

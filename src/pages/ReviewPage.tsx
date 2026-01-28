import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useReviewRequestByToken, useSubmitReview } from "@/hooks/useReviews";

export default function ReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const { data: reviewRequest, isLoading: isLoadingRequest } = useReviewRequestByToken(token);
  const submitReview = useSubmitReview();
  
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewRequest) return;
    
    try {
      await submitReview.mutateAsync({
        appointment_id: reviewRequest.appointment_id,
        user_id: reviewRequest.user_id,
        client_name: clientName || reviewRequest.client_name,
        client_location: clientLocation || undefined,
        rating,
        review_text: reviewText,
        request_token: token || undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoadingRequest) {
    return (
      <Layout>
        <div className="container section-padding">
          <div className="max-w-lg mx-auto flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!token || !reviewRequest) {
    return (
      <Layout>
        <div className="container section-padding">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold mb-2">
                    Enlace no válido o expirado
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Este enlace de reseña ya no está disponible o ha expirado.
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Volver al inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container section-padding">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold mb-2">
                    ¡Gracias por tu reseña!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Tu opinión es muy valiosa para nosotros y nos ayuda a seguir mejorando.
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Volver al inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container section-padding">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">
                Deja tu reseña
              </CardTitle>
              <CardDescription>
                Hola {reviewRequest.client_name}, nos encantaría conocer tu experiencia con nuestros servicios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="space-y-2">
                  <Label>¿Cómo calificarías tu experiencia?</Label>
                  <div className="flex gap-2 justify-center py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review text */}
                <div className="space-y-2">
                  <Label htmlFor="review">Tu reseña</Label>
                  <Textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    rows={4}
                    required
                    minLength={10}
                  />
                </div>

                {/* Client name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Tu nombre (como aparecerá en la reseña)</Label>
                  <Input
                    id="name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={reviewRequest.client_name}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Tu ubicación (opcional)</Label>
                  <Input
                    id="location"
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="Ej: Monterrey, San Pedro..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitReview.isPending || !reviewText.trim()}
                >
                  {submitReview.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar reseña"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

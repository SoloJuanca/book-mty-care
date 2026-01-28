import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Send, 
  Loader2,
  Clock,
  CheckCircle2,
  MessageSquare,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  useAllReviews, 
  useUpdateReview, 
  useDeleteReview,
  useReviewRequests,
  useCreateReviewRequest,
  useEligibleAppointmentsForReview,
} from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const SERVICE_LABELS: Record<string, string> = {
  rehabilitacion: "Rehabilitación",
  quiropraxia: "Quiropraxia",
  masajes_descontracturantes: "Masajes Descontracturantes",
  masajes_relajantes: "Masajes Relajantes",
};

export default function AdminReviews() {
  const { toast } = useToast();
  const { data: reviews, isLoading: isLoadingReviews } = useAllReviews();
  const { data: reviewRequests, isLoading: isLoadingRequests } = useReviewRequests();
  const { data: eligibleAppointments, isLoading: isLoadingEligible } = useEligibleAppointmentsForReview();
  
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const createReviewRequest = useCreateReviewRequest();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const pendingReviews = reviews?.filter(r => !r.is_approved) || [];
  const approvedReviews = reviews?.filter(r => r.is_approved) || [];
  const pendingRequests = reviewRequests?.filter(r => r.status === "pending") || [];
  const completedRequests = reviewRequests?.filter(r => r.status === "completed") || [];

  const handleApprove = (id: string) => {
    updateReview.mutate({ id, is_approved: true });
  };

  const handleReject = (id: string) => {
    updateReview.mutate({ id, is_approved: false });
  };

  const handleToggleFeatured = (id: string, currentValue: boolean) => {
    updateReview.mutate({ id, is_featured: !currentValue });
  };

  const handleDelete = () => {
    if (reviewToDelete) {
      deleteReview.mutate(reviewToDelete);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleSendRequest = async (appointment: any) => {
    if (!appointment.client_email) {
      toast({
        title: "Error",
        description: "Este cliente no tiene email registrado.",
        variant: "destructive",
      });
      return;
    }

    setSendingRequest(appointment.id);
    try {
      const result = await createReviewRequest.mutateAsync({
        appointment_id: appointment.id,
        user_id: appointment.user_id,
        client_email: appointment.client_email,
        client_name: appointment.client_name,
      });

      // Generate the review link
      const reviewUrl = `${window.location.origin}/resena?token=${result.request_token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(reviewUrl);
      
      toast({
        title: "Solicitud creada",
        description: "El enlace de reseña ha sido copiado al portapapeles.",
      });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSendingRequest(null);
    }
  };

  const copyReviewLink = async (token: string) => {
    const reviewUrl = `${window.location.origin}/resena?token=${token}`;
    await navigator.clipboard.writeText(reviewUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace de reseña ha sido copiado al portapapeles.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestión de Reseñas</h1>
          <p className="text-muted-foreground">
            Aprueba reseñas y solicita opiniones a tus clientes
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pendientes
              {pendingReviews.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Aprobadas
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Send className="h-4 w-4" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="request-new" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Solicitar Nueva
            </TabsTrigger>
          </TabsList>

          {/* Pending Reviews */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas Pendientes de Aprobación</CardTitle>
                <CardDescription>
                  Revisa y aprueba las reseñas antes de que aparezcan públicamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay reseñas pendientes de aprobación
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map(review => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onApprove={() => handleApprove(review.id)}
                        onReject={() => handleReject(review.id)}
                        onDelete={() => {
                          setReviewToDelete(review.id);
                          setDeleteDialogOpen(true);
                        }}
                        isPending
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Reviews */}
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas Aprobadas</CardTitle>
                <CardDescription>
                  Estas reseñas son visibles públicamente en tu sitio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : approvedReviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay reseñas aprobadas aún
                  </p>
                ) : (
                  <div className="space-y-4">
                    {approvedReviews.map(review => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onApprove={() => {}}
                        onReject={() => handleReject(review.id)}
                        onDelete={() => {
                          setReviewToDelete(review.id);
                          setDeleteDialogOpen(true);
                        }}
                        onToggleFeatured={() => handleToggleFeatured(review.id, review.is_featured)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Reseña</CardTitle>
                <CardDescription>
                  Estado de las solicitudes enviadas a clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (pendingRequests.length === 0 && completedRequests.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay solicitudes de reseña
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{request.client_name}</p>
                          <p className="text-sm text-muted-foreground">{request.client_email}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviada: {format(new Date(request.sent_at), "d MMM yyyy", { locale: es })}
                            {" • "}
                            Expira: {format(new Date(request.expires_at), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyReviewLink(request.request_token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {completedRequests.map(request => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{request.client_name}</p>
                          <p className="text-sm text-muted-foreground">{request.client_email}</p>
                          <p className="text-xs text-muted-foreground">
                            Completada: {request.completed_at && format(new Date(request.completed_at), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <Badge className="bg-primary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Request New Review */}
          <TabsContent value="request-new">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Nueva Reseña</CardTitle>
                <CardDescription>
                  Selecciona un cliente con cita completada para solicitarle una reseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEligible ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : eligibleAppointments?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay clientes elegibles para solicitar reseña
                  </p>
                ) : (
                  <div className="space-y-3">
                    {eligibleAppointments?.map(apt => (
                      <div 
                        key={apt.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{apt.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.client_email || "Sin email"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {SERVICE_LABELS[apt.service] || apt.service} • {format(new Date(apt.appointment_date), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendRequest(apt)}
                          disabled={!apt.client_email || sendingRequest === apt.id}
                        >
                          {sendingRequest === apt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Solicitar
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar reseña?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

interface ReviewCardProps {
  review: any;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onToggleFeatured?: () => void;
  isPending?: boolean;
}

function ReviewCard({ review, onApprove, onReject, onDelete, onToggleFeatured, isPending }: ReviewCardProps) {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.client_name}</span>
            {review.client_location && (
              <span className="text-sm text-muted-foreground">
                • {review.client_location}
              </span>
            )}
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(review.created_at), "d MMM yyyy", { locale: es })}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground italic">
        "{review.review_text}"
      </p>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {isPending ? (
            <>
              <Button size="sm" onClick={onApprove} className="gap-1">
                <Check className="h-4 w-4" />
                Aprobar
              </Button>
              <Button size="sm" variant="outline" onClick={onReject} className="gap-1">
                <X className="h-4 w-4" />
                Rechazar
              </Button>
            </>
          ) : (
            <>
              {onToggleFeatured && (
                <Button 
                  size="sm" 
                  variant={review.is_featured ? "default" : "outline"}
                  onClick={onToggleFeatured}
                >
                  {review.is_featured ? "Destacada" : "Destacar"}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onReject}>
                Desaprobar
              </Button>
            </>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

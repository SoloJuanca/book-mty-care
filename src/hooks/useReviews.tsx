import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  appointment_id: string;
  user_id: string | null;
  client_name: string;
  client_location: string | null;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewRequest {
  id: string;
  appointment_id: string;
  user_id: string | null;
  client_email: string;
  client_name: string;
  request_token: string;
  status: "pending" | "completed" | "expired";
  sent_at: string;
  completed_at: string | null;
  expires_at: string;
  created_at: string;
}

// Hook to fetch approved reviews for public display
export function useApprovedReviews(limit?: number) {
  return useQuery({
    queryKey: ["reviews", "approved", limit],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Review[];
    },
  });
}

// Hook to fetch all reviews (admin only)
export function useAllReviews() {
  return useQuery({
    queryKey: ["reviews", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    },
  });
}

// Hook to fetch review requests (admin only)
export function useReviewRequests() {
  return useQuery({
    queryKey: ["review-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ReviewRequest[];
    },
  });
}

// Hook to approve/reject a review
export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      is_approved, 
      is_featured 
    }: { 
      id: string; 
      is_approved?: boolean; 
      is_featured?: boolean;
    }) => {
      const updates: Partial<Review> = {};
      if (is_approved !== undefined) updates.is_approved = is_approved;
      if (is_featured !== undefined) updates.is_featured = is_featured;

      const { error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Reseña actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reseña.",
        variant: "destructive",
      });
      console.error("Error updating review:", error);
    },
  });
}

// Hook to delete a review
export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña.",
        variant: "destructive",
      });
      console.error("Error deleting review:", error);
    },
  });
}

// Hook to create a review request
export function useCreateReviewRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      appointment_id, 
      user_id, 
      client_email, 
      client_name 
    }: { 
      appointment_id: string; 
      user_id: string | null; 
      client_email: string; 
      client_name: string;
    }) => {
      const { data, error } = await supabase
        .from("review_requests")
        .insert({
          appointment_id,
          user_id,
          client_email,
          client_name,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReviewRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-requests"] });
      toast({
        title: "Solicitud creada",
        description: "Se ha creado la solicitud de reseña.",
      });
    },
    onError: (error: any) => {
      const message = error?.message?.includes("duplicate") 
        ? "Ya existe una solicitud de reseña para esta cita."
        : "No se pudo crear la solicitud.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Error creating review request:", error);
    },
  });
}

// Hook to submit a review (for clients)
export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      appointment_id,
      user_id,
      client_name,
      client_location,
      rating,
      review_text,
      request_token,
    }: {
      appointment_id: string;
      user_id?: string | null;
      client_name: string;
      client_location?: string;
      rating: number;
      review_text: string;
      request_token?: string;
    }) => {
      // Insert the review
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .insert({
          appointment_id,
          user_id: user_id || null,
          client_name,
          client_location: client_location || null,
          rating,
          review_text,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // If there's a request token, mark it as completed
      if (request_token) {
        await supabase
          .from("review_requests")
          .update({ 
            status: "completed", 
            completed_at: new Date().toISOString() 
          })
          .eq("request_token", request_token);
      }

      return review as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review-requests"] });
      toast({
        title: "¡Gracias por tu reseña!",
        description: "Tu opinión es muy importante para nosotros.",
      });
    },
    onError: (error: any) => {
      const message = error?.message?.includes("duplicate")
        ? "Ya has dejado una reseña para esta cita."
        : "No se pudo enviar la reseña. Intenta de nuevo.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Error submitting review:", error);
    },
  });
}

// Hook to get review request by token (for public review page)
export function useReviewRequestByToken(token: string | null) {
  return useQuery({
    queryKey: ["review-request", token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("request_token", token)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data as ReviewRequest;
    },
    enabled: !!token,
  });
}

// Hook to get appointments eligible for review request (completed, no review yet)
export function useEligibleAppointmentsForReview() {
  return useQuery({
    queryKey: ["eligible-appointments-for-review"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          client_name,
          client_email,
          client_phone,
          user_id,
          appointment_date,
          service,
          status
        `)
        .eq("status", "completed")
        .not("client_email", "is", null)
        .order("appointment_date", { ascending: false });

      if (error) throw error;

      // Filter out appointments that already have reviews or pending requests
      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("appointment_id");
      
      const { data: existingRequests } = await supabase
        .from("review_requests")
        .select("appointment_id")
        .eq("status", "pending");

      const reviewedIds = new Set(existingReviews?.map(r => r.appointment_id) || []);
      const requestedIds = new Set(existingRequests?.map(r => r.appointment_id) || []);

      return data?.filter(apt => 
        !reviewedIds.has(apt.id) && !requestedIds.has(apt.id)
      ) || [];
    },
  });
}

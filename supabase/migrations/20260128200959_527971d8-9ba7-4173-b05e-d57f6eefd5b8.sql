-- Create reviews table for client testimonials
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_location TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id) -- One review per appointment
);

-- Create review_requests table for admin to request reviews from clients
CREATE TABLE public.review_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  request_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id) -- One request per appointment
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
-- Anyone can read approved reviews (for the public testimonials section)
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews
  FOR SELECT
  USING (is_approved = true);

-- Users can read their own reviews
CREATE POLICY "Users can read their own reviews"
  ON public.reviews
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create reviews for their own completed appointments
CREATE POLICY "Users can create reviews for completed appointments"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_id
        AND a.status = 'completed'
        AND (
          (a.user_id = auth.uid()) 
          OR 
          (auth.uid() IS NULL AND EXISTS (
            SELECT 1 FROM public.review_requests rr 
            WHERE rr.appointment_id = reviews.appointment_id 
              AND rr.status = 'pending'
              AND rr.expires_at > now()
          ))
        )
    )
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for review_requests
-- Admins can manage all review requests
CREATE POLICY "Admins can manage review requests"
  ON public.review_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own review requests
CREATE POLICY "Users can view their own review requests"
  ON public.review_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Add updated_at trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster queries
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_reviews_appointment_id ON public.reviews(appointment_id);
CREATE INDEX idx_review_requests_token ON public.review_requests(request_token);
CREATE INDEX idx_review_requests_status ON public.review_requests(status);
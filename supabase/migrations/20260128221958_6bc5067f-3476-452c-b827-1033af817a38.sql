-- Table to store admin notification emails
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_emails_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin emails
CREATE POLICY "Admins can manage admin emails"
ON public.admin_emails
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions need to read emails (using service role, so RLS bypassed)

-- Trigger for updated_at
CREATE TRIGGER update_admin_emails_updated_at
BEFORE UPDATE ON public.admin_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default admin email
INSERT INTO public.admin_emails (email, name, is_active)
VALUES ('ccarlosmmora13@gmail.com', 'Carlos Mora', true);
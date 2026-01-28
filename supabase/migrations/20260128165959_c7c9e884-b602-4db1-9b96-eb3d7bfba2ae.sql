-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read appointments for slot checking" ON public.appointments;

-- Create a secure view for public slot availability checking (only date/time, no PII)
CREATE VIEW public.appointment_slots
WITH (security_invoker = on) AS
SELECT 
  appointment_date,
  appointment_time,
  duration_minutes,
  status
FROM public.appointments
WHERE status != 'cancelled';

-- Create policy to allow public SELECT only through the view's limited columns
-- Base table SELECT is now restricted to authenticated users only
CREATE POLICY "Only authenticated users can read full appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);

-- Grant public access to the view for slot checking
GRANT SELECT ON public.appointment_slots TO anon;
GRANT SELECT ON public.appointment_slots TO authenticated;
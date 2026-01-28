-- Fix the remaining permissive INSERT policy for appointments
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Allow anyone (including anonymous) to create appointments (for guest booking)
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Guest bookings: user_id must be null for anon users
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Authenticated users: user_id must match their own id or be null (guest mode while logged in)
  (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  OR
  -- Admins can create appointments for anyone
  public.has_role(auth.uid(), 'admin')
);
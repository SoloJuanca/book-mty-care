-- Fix overly permissive RLS policies on existing tables to use has_role function

-- Fix availability_settings policies
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON public.availability_settings;
CREATE POLICY "Admins can manage availability"
ON public.availability_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix blocked_slots policies  
DROP POLICY IF EXISTS "Authenticated users can manage blocked slots" ON public.blocked_slots;
CREATE POLICY "Admins can manage blocked slots"
ON public.blocked_slots
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix service_durations policies
DROP POLICY IF EXISTS "Authenticated users can manage service durations" ON public.service_durations;
CREATE POLICY "Admins can manage service durations"
ON public.service_durations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix appointments management policy (keep insert for anyone, update for admins/owners)
DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.appointments;

CREATE POLICY "Admins can manage all appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND NOT public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid());
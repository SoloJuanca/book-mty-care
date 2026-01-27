-- Enum for services
CREATE TYPE public.service_type AS ENUM ('rehabilitacion', 'quiropraxia', 'masajes_descontracturantes', 'masajes_relajantes');

-- Table for admin availability settings
CREATE TABLE public.availability_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '19:00:00',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Table for service durations
CREATE TABLE public.service_durations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service service_type NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for blocked time slots
CREATE TABLE public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  is_full_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service service_type NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Public read policy for availability (needed for booking flow)
CREATE POLICY "Anyone can read availability settings"
ON public.availability_settings FOR SELECT
USING (true);

-- Public read policy for service durations
CREATE POLICY "Anyone can read service durations"
ON public.service_durations FOR SELECT
USING (true);

-- Public read policy for blocked slots (needed for booking flow)
CREATE POLICY "Anyone can read blocked slots"
ON public.blocked_slots FOR SELECT
USING (true);

-- Public insert policy for appointments (customers can create bookings)
CREATE POLICY "Anyone can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (true);

-- Public read for appointments (limited - only see own by phone later if needed)
CREATE POLICY "Anyone can read appointments for slot checking"
ON public.appointments FOR SELECT
USING (true);

-- Admin policies (authenticated users can manage everything)
CREATE POLICY "Authenticated users can manage availability"
ON public.availability_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage service durations"
ON public.service_durations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage blocked slots"
ON public.blocked_slots FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage appointments"
ON public.appointments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default availability (Mon-Fri 9-19, Sat 9-14, Sun closed)
INSERT INTO public.availability_settings (day_of_week, start_time, end_time, is_available) VALUES
(0, '09:00', '14:00', false), -- Domingo cerrado
(1, '09:00', '19:00', true),  -- Lunes
(2, '09:00', '19:00', true),  -- Martes
(3, '09:00', '19:00', true),  -- Miércoles
(4, '09:00', '19:00', true),  -- Jueves
(5, '09:00', '19:00', true),  -- Viernes
(6, '09:00', '14:00', true);  -- Sábado

-- Insert default service durations
INSERT INTO public.service_durations (service, duration_minutes) VALUES
('rehabilitacion', 60),
('quiropraxia', 45),
('masajes_descontracturantes', 60),
('masajes_relajantes', 60);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_availability_settings_updated_at
BEFORE UPDATE ON public.availability_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_service_durations_updated_at
BEFORE UPDATE ON public.service_durations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster appointment queries
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_service ON public.appointments(service);
CREATE INDEX idx_blocked_slots_date ON public.blocked_slots(blocked_date);
-- Create function to check for overlapping appointments
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_start TIME;
  new_end TIME;
  overlap_count INTEGER;
BEGIN
  new_start := NEW.appointment_time;
  new_end := NEW.appointment_time + (NEW.duration_minutes || ' minutes')::INTERVAL;
  
  -- Check for overlapping appointments on the same date (excluding cancelled)
  SELECT COUNT(*) INTO overlap_count
  FROM public.appointments
  WHERE appointment_date = NEW.appointment_date
    AND status != 'cancelled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      -- New appointment starts during existing appointment
      (NEW.appointment_time >= appointment_time 
       AND NEW.appointment_time < appointment_time + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment ends during existing appointment
      (new_end > appointment_time 
       AND new_end <= appointment_time + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment completely contains existing appointment
      (NEW.appointment_time <= appointment_time 
       AND new_end >= appointment_time + (duration_minutes || ' minutes')::INTERVAL)
    );
  
  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'Este horario ya no está disponible. Otra cita fue reservada en este horario.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent overlapping appointments on INSERT
CREATE TRIGGER prevent_appointment_overlap_insert
BEFORE INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.check_appointment_overlap();

-- Create trigger to prevent overlapping appointments on UPDATE  
CREATE TRIGGER prevent_appointment_overlap_update
BEFORE UPDATE ON public.appointments
FOR EACH ROW
WHEN (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date 
      OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time
      OR OLD.duration_minutes IS DISTINCT FROM NEW.duration_minutes
      OR OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.check_appointment_overlap();
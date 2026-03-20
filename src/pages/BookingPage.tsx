import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { services, getServiceById } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, addDays, isBefore, startOfToday, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  User,
  LogIn,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];
type Step = "service" | "date" | "time" | "info" | "confirmation";

interface FormData {
  service: ServiceType | "";
  date: Date | undefined;
  time: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const initialService = searchParams.get("servicio") || "";
  const validInitialService = [
    "rehabilitacion",
    "quiropraxia",
    "masajes_descontracturantes",
    "masajes_relajantes",
  ].includes(initialService)
    ? (initialService as ServiceType)
    : "";

  const [step, setStep] = useState<Step>(validInitialService ? "date" : "service");
  const [formData, setFormData] = useState<FormData>({
    service: validInitialService,
    date: undefined,
    time: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const selectedService = formData.service ? getServiceById(formData.service) : undefined;

  // Pre-fill form with user profile data
  useEffect(() => {
    if (user && !profileLoaded) {
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: profile.full_name || prev.name,
            phone: profile.phone || prev.phone,
            email: profile.email || user.email || prev.email,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
          }));
        }
        setProfileLoaded(true);
      };
      fetchProfile();
    }
  }, [user, profileLoaded]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date && formData.service) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.service]);

  const fetchAvailableSlots = async () => {
    if (!formData.date || !formData.service) return;

    setLoading(true);
    try {
      const dayOfWeek = formData.date.getDay();
      const dateStr = format(formData.date, "yyyy-MM-dd");

      // Get availability for this day
      const { data: availability } = await supabase
        .from("availability_settings")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .single();

      if (!availability || !availability.is_available) {
        setAvailableSlots([]);
        return;
      }

      // Get service duration
      const { data: serviceDuration } = await supabase
        .from("service_durations")
        .select("duration_minutes")
        .eq("service", formData.service)
        .single();

      const duration = serviceDuration?.duration_minutes || 60;

      // Get blocked slots for this date
      const { data: blockedSlots } = await supabase.from("blocked_slots").select("*").eq("blocked_date", dateStr);

      // Check if full day is blocked
      const fullDayBlocked = blockedSlots?.some((b) => b.is_full_day);
      if (fullDayBlocked) {
        setAvailableSlots([]);
        return;
      }

      // Get existing appointments for this date (using secure view that doesn't expose PII)
      const { data: appointments } = await supabase
        .from("appointment_slots")
        .select("appointment_time, duration_minutes")
        .eq("appointment_date", dateStr);

      // Generate time slots
      const startTime = parse(availability.start_time, "HH:mm:ss", new Date());
      const endTime = parse(availability.end_time, "HH:mm:ss", new Date());

      const slots: string[] = [];
      let currentTime = startTime;

      while (isBefore(currentTime, endTime)) {
        const timeStr = format(currentTime, "HH:mm");
        const currentEnd = new Date(currentTime.getTime() + duration * 60000);

        // Check if slot overlaps with existing appointments
        const isBooked = appointments?.some((apt) => {
          const aptStart = parse(apt.appointment_time, "HH:mm:ss", new Date());
          const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 60) * 60000);
          return (
            (currentTime >= aptStart && currentTime < aptEnd) ||
            (currentEnd > aptStart && currentEnd <= aptEnd) ||
            (currentTime <= aptStart && currentEnd >= aptEnd)
          );
        });

        // Check if slot overlaps with blocked times
        const isBlocked = blockedSlots?.some((block) => {
          if (!block.start_time || !block.end_time) return false;
          const blockStart = parse(block.start_time, "HH:mm:ss", new Date());
          const blockEnd = parse(block.end_time, "HH:mm:ss", new Date());
          return (
            (currentTime >= blockStart && currentTime < blockEnd) || (currentEnd > blockStart && currentEnd <= blockEnd)
          );
        });

        if (!isBooked && !isBlocked && (isBefore(currentEnd, endTime) || currentEnd.getTime() === endTime.getTime())) {
          slots.push(timeStr);
        }

        currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30 min intervals
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.service || !formData.time || !formData.name || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: serviceDuration } = await supabase
        .from("service_durations")
        .select("duration_minutes")
        .eq("service", formData.service)
        .single();

      const { error } = await supabase.from("appointments").insert({
        service: formData.service,
        appointment_date: format(formData.date, "yyyy-MM-dd"),
        appointment_time: formData.time + ":00",
        duration_minutes: serviceDuration?.duration_minutes || 60,
        client_name: formData.name,
        client_phone: formData.phone,
        client_email: formData.email || null,
        client_address: formData.address,
        notes: formData.notes || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      // Send email notification (fire and forget - don't block confirmation)
      supabase.functions
        .invoke("send-notification", {
          body: {
            type: "new_appointment",
            appointment: {
              client_name: formData.name,
              client_email: formData.email || undefined,
              client_phone: formData.phone,
              client_address: formData.address,
              service: formData.service,
              appointment_date: format(formData.date, "yyyy-MM-dd"),
              appointment_time: formData.time + ":00",
            },
          },
        })
        .then((res) => {
          if (res.error) {
            console.error("Error sending notification:", res.error);
          } else {
            console.log("Notification sent:", res.data);
          }
        });

      setStep("confirmation");
    } catch (error: any) {
      console.error("Error creating appointment:", error);

      // Check if it's an overlap error from the database trigger
      const isOverlapError = error?.message?.includes("ya no está disponible") || error?.message?.includes("overlap");

      toast({
        title: isOverlapError ? "Horario no disponible" : "Error",
        description: isOverlapError
          ? "Este horario fue reservado por alguien más. Por favor selecciona otro horario."
          : "No se pudo crear la cita. Por favor intenta de nuevo.",
        variant: "destructive",
      });

      // If overlap error, go back to time selection and refresh slots
      if (isOverlapError) {
        setStep("time");
        fetchAvailableSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: "service", label: "Servicio" },
    { id: "date", label: "Fecha" },
    { id: "time", label: "Horario" },
    { id: "info", label: "Datos" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  if (step === "confirmation") {
    return (
      <Layout showFloating={false}>
        <div className="container section-padding">
          <div className="max-w-lg mx-auto text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">¡Cita Registrada!</h1>
            <p className="text-muted-foreground mb-8">
              Tu solicitud de cita ha sido recibida. Te contactaremos pronto para confirmar.
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de tu cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium">{selectedService?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {formData.date && format(formData.date, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium">{formData.time} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="font-medium text-right max-w-[60%]">{formData.address}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/")} className="font-semibold">
                Volver al Inicio
              </Button>
              <a href="https://wa.me/528112411746" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full font-semibold">
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloating={false}>
      <div className="container section-padding">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-1 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold text-center mb-8">
            {step === "service" && "Selecciona un servicio"}
            {step === "date" && "Elige una fecha"}
            {step === "time" && "Selecciona un horario"}
            {step === "info" && "Tus datos de contacto"}
          </h1>

          {/* Step: Service */}
          {step === "service" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setFormData({ ...formData, service: service.id as ServiceType });
                    setStep("date");
                  }}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    formData.service === service.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="h-10 w-10 rounded-lg hero-gradient flex items-center justify-center mb-3">
                    <service.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{service.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </div>
                    {service.price && (
                      <span className="text-sm font-display font-bold text-primary">{service.price}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step: Date */}
          {step === "date" && (
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  setFormData({ ...formData, date, time: "" });
                  if (date) setStep("time");
                }}
                disabled={(date) => isBefore(date, startOfToday())}
                locale={es}
                className="rounded-xl border"
              />
              <Button variant="ghost" onClick={() => setStep("service")} className="mt-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cambiar servicio
              </Button>
            </div>
          )}

          {/* Step: Time */}
          {step === "time" && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  {formData.date && format(formData.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setFormData({ ...formData, time: slot });
                        setStep("info");
                      }}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        formData.time === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay horarios disponibles para esta fecha.</p>
                  <p className="text-sm mt-2">Prueba seleccionando otro día.</p>
                </div>
              )}

              <div className="flex justify-center mt-6">
                <Button variant="ghost" onClick={() => setStep("date")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Cambiar fecha
                </Button>
              </div>
            </div>
          )}

          {/* Step: Info */}
          {step === "info" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span>{selectedService?.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formData.date && format(formData.date, "d MMM", { locale: es })} a las {formData.time}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Login prompt for guests */}
                {!user && !authLoading && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">¿Tienes cuenta?</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Inicia sesión para guardar tu cita y ver tu historial
                        </p>
                        <Link
                          to={`/cuenta?redirect=/reservar${formData.service ? `&servicio=${formData.service}` : ""}`}
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <LogIn className="h-4 w-4" />
                            Iniciar Sesión
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logged in user indicator */}
                {user && (
                  <div className="bg-primary/5 rounded-lg p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full hero-gradient flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Reservando como usuario registrado</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="81 1234 5678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección de la sesión *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, número, colonia, municipio"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    📍 Servicio a domicilio en Monterrey y Zona Metropolitana. Proporciona tu dirección para que podamos acudir a tu sesión.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="¿Algo que debamos saber antes de tu cita?"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("time")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.phone || submitting}
                    className="flex-1 font-semibold gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reservando...
                      </>
                    ) : (
                      <>
                        Confirmar Reserva
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

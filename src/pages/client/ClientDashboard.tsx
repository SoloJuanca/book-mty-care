import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  Calendar,
  Clock,
  Plus,
  User,
  Phone,
  Mail,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { getServiceById } from "@/lib/services";

interface Appointment {
  id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  duration_minutes: number;
}

interface Profile {
  full_name: string;
  phone: string | null;
  email: string | null;
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cuenta");
    } else if (!authLoading && isAdmin) {
      navigate("/admin/citas");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return !isPast(aptDate) || isToday(aptDate);
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return isPast(aptDate) && !isToday(aptDate);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmada</Badge>;
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "completed":
        return <Badge className="bg-primary">Completada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout showFloating={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFloating={false}>
      <div className="container section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Hola, {profile?.full_name?.split(" ")[0] || "Usuario"}
              </h1>
              <p className="text-muted-foreground">
                Gestiona tus citas y revisa tu historial
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/reservar">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Cita
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-sm text-muted-foreground">Próximas citas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{pastAppointments.length}</div>
                <p className="text-sm text-muted-foreground">Citas pasadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Próximas ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="history">Historial ({pastAppointments.length})</TabsTrigger>
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No tienes citas programadas</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Agenda tu primera cita para comenzar tu tratamiento
                    </p>
                    <Link to="/reservar">
                      <Button>Agendar Cita</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((apt) => {
                  const service = getServiceById(apt.service);
                  return (
                    <Card key={apt.id}>
                      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-6">
                        <div className="h-12 w-12 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
                          {service?.icon && <service.icon className="h-6 w-6 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{service?.title}</h3>
                            {getStatusBadge(apt.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(parseISO(apt.appointment_date), "EEEE d 'de' MMMM", { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {apt.appointment_time.slice(0, 5)} hrs
                            </div>
                          </div>
                          {apt.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{apt.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Sin historial</h3>
                    <p className="text-muted-foreground text-center">
                      Tus citas pasadas aparecerán aquí
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map((apt) => {
                  const service = getServiceById(apt.service);
                  return (
                    <Card key={apt.id} className="opacity-75">
                      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-6">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {service?.icon && <service.icon className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{service?.title}</h3>
                            {getStatusBadge(apt.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(parseISO(apt.appointment_date), "d 'de' MMMM, yyyy", { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {apt.appointment_time.slice(0, 5)} hrs
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Información</CardTitle>
                  <CardDescription>Datos de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{profile?.full_name || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile?.email || user?.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{profile?.phone || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Phone, Mail, Search, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type ServiceType = Database["public"]["Enums"]["service_type"];

const serviceNames: Record<ServiceType, string> = {
  rehabilitacion: "Rehabilitación",
  quiropraxia: "Quiropraxia",
  masajes_descontracturantes: "M. Descontracturantes",
  masajes_relajantes: "M. Relajantes",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-green-500/10 text-green-600 border-green-200",
};

export default function AdminAppointments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter, serviceFilter, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (dateFilter) {
        query = query.eq("appointment_date", format(dateFilter, "yyyy-MM-dd"));
      }

      if (serviceFilter !== "all") {
        query = query.eq("service", serviceFilter as ServiceType);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast({ title: "Actualizado", description: `Cita marcada como ${statusLabels[status]}.` });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      apt.client_name.toLowerCase().includes(search) ||
      apt.client_phone.includes(search) ||
      apt.client_email?.toLowerCase().includes(search)
    );
  });

  const todayCount = appointments.filter(
    (a) => a.appointment_date === format(startOfToday(), "yyyy-MM-dd") && a.status !== "cancelled"
  ).length;

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Gestión de Citas</h1>
            <p className="text-muted-foreground">
              Visualiza y administra las citas de tus pacientes.
            </p>
          </div>
          <div className="flex gap-2">
            <Card className="px-4 py-2">
              <div className="text-xs text-muted-foreground">Hoy</div>
              <div className="font-display font-bold text-lg">{todayCount}</div>
            </Card>
            <Card className="px-4 py-2">
              <div className="text-xs text-muted-foreground">Pendientes</div>
              <div className="font-display font-bold text-lg text-amber-600">{pendingCount}</div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateFilter
                      ? format(dateFilter, "d MMM yyyy", { locale: es })
                      : "Todas las fechas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    locale={es}
                  />
                  {dateFilter && (
                    <div className="p-3 pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateFilter(undefined)}
                        className="w-full"
                      >
                        Limpiar filtro
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {(Object.keys(serviceNames) as ServiceType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {serviceNames[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <Card key={apt.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-4 lg:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.client_name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {apt.client_phone}
                          </span>
                          {apt.client_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {apt.client_email}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[apt.status]}>
                        {statusLabels[apt.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {serviceNames[apt.service]}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(apt.appointment_date + "T12:00:00"), "EEE d MMM", {
                          locale: es,
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {apt.appointment_time?.slice(0, 5)} hrs
                      </span>
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-2 rounded">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex lg:flex-col border-t lg:border-t-0 lg:border-l border-border">
                    {apt.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, "confirmed")}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, "cancelled")}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors border-l lg:border-l-0 lg:border-t border-border"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar
                        </button>
                      </>
                    )}
                    {apt.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(apt.id, "completed")}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {appointments.length === 0
                ? "No hay citas registradas."
                : "No se encontraron citas con los filtros aplicados."}
            </p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AvailabilitySetting = Database["public"]["Tables"]["availability_settings"]["Row"];
type ServiceDuration = Database["public"]["Tables"]["service_durations"]["Row"];
type BlockedSlot = Database["public"]["Tables"]["blocked_slots"]["Row"];

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const serviceNames: Record<string, string> = {
  rehabilitacion: "Rehabilitación",
  quiropraxia: "Quiropraxia",
  masajes_descontracturantes: "Masajes Descontracturantes",
  masajes_relajantes: "Masajes Relajantes",
};

export default function AdminAvailability() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySetting[]>([]);
  const [durations, setDurations] = useState<ServiceDuration[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [newBlockDate, setNewBlockDate] = useState<Date | undefined>();
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, durRes, blockRes] = await Promise.all([
        supabase.from("availability_settings").select("*").order("day_of_week"),
        supabase.from("service_durations").select("*"),
        supabase.from("blocked_slots").select("*").order("blocked_date", { ascending: false }),
      ]);

      if (availRes.data) setAvailability(availRes.data);
      if (durRes.data) setDurations(durRes.data);
      if (blockRes.data) setBlockedSlots(blockRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (id: string, updates: Partial<AvailabilitySetting>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("availability_settings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setAvailability((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
      toast({ title: "Guardado", description: "Disponibilidad actualizada." });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDuration = async (id: string, minutes: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("service_durations")
        .update({ duration_minutes: minutes })
        .eq("id", id);

      if (error) throw error;

      setDurations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, duration_minutes: minutes } : d))
      );
      toast({ title: "Guardado", description: "Duración actualizada." });
    } catch (error) {
      console.error("Error updating duration:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addBlockedSlot = async () => {
    if (!newBlockDate) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("blocked_slots")
        .insert({
          blocked_date: format(newBlockDate, "yyyy-MM-dd"),
          is_full_day: true,
          reason: newBlockReason || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedSlots((prev) => [data, ...prev]);
      setNewBlockDate(undefined);
      setNewBlockReason("");
      toast({ title: "Bloqueado", description: "Fecha bloqueada exitosamente." });
    } catch (error) {
      console.error("Error adding blocked slot:", error);
      toast({
        title: "Error",
        description: "No se pudo bloquear la fecha.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeBlockedSlot = async (id: string) => {
    try {
      const { error } = await supabase.from("blocked_slots").delete().eq("id", id);

      if (error) throw error;

      setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Eliminado", description: "Bloqueo eliminado." });
    } catch (error) {
      console.error("Error removing blocked slot:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Configurar Disponibilidad</h1>
          <p className="text-muted-foreground">
            Gestiona los horarios de atención y bloqueos de agenda.
          </p>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((day) => (
                <div
                  key={day.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 sm:w-36">
                    <Switch
                      checked={day.is_available}
                      onCheckedChange={(checked) =>
                        updateAvailability(day.id, { is_available: checked })
                      }
                    />
                    <span className="font-medium">{dayNames[day.day_of_week]}</span>
                  </div>
                  {day.is_available && (
                    <div className="flex items-center gap-2 text-sm">
                      <Input
                        type="time"
                        value={day.start_time?.slice(0, 5) || "09:00"}
                        onChange={(e) =>
                          updateAvailability(day.id, { start_time: e.target.value + ":00" })
                        }
                        className="w-28"
                      />
                      <span className="text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={day.end_time?.slice(0, 5) || "19:00"}
                        onChange={(e) =>
                          updateAvailability(day.id, { end_time: e.target.value + ":00" })
                        }
                        className="w-28"
                      />
                    </div>
                  )}
                  {!day.is_available && (
                    <span className="text-sm text-muted-foreground">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Durations */}
        <Card>
          <CardHeader>
            <CardTitle>Duración por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {durations.map((duration) => (
                <div
                  key={duration.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">
                    {serviceNames[duration.service] || duration.service}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={duration.duration_minutes}
                      onChange={(e) => updateDuration(duration.id, parseInt(e.target.value) || 60)}
                      className="w-20"
                      min={15}
                      max={180}
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blocked Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Bloquear Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {newBlockDate
                      ? format(newBlockDate, "d 'de' MMMM, yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newBlockDate}
                    onSelect={setNewBlockDate}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Motivo (opcional)"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                className="sm:flex-1"
              />
              <Button onClick={addBlockedSlot} disabled={!newBlockDate || saving} className="gap-2">
                <Plus className="h-4 w-4" />
                Bloquear
              </Button>
            </div>

            {blockedSlots.length > 0 ? (
              <div className="space-y-2">
                {blockedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <div>
                      <span className="font-medium">
                        {format(new Date(slot.blocked_date + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                      {slot.reason && (
                        <span className="text-sm text-muted-foreground ml-2">
                          — {slot.reason}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlockedSlot(slot.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No hay fechas bloqueadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

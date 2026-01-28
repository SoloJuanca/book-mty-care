import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Mail, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminEmail {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchAdminEmails();
  }, []);

  const fetchAdminEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_emails")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAdminEmails(data || []);
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los correos de administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un correo electrónico.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Error",
        description: "Ingresa un correo electrónico válido.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("admin_emails")
        .insert({
          email: newEmail.trim().toLowerCase(),
          name: newName.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este correo ya está registrado.");
        }
        throw error;
      }

      setAdminEmails((prev) => [...prev, data]);
      setNewEmail("");
      setNewName("");
      toast({ title: "Agregado", description: "Correo de administrador agregado." });
    } catch (error: any) {
      console.error("Error adding admin email:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el correo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_emails")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      setAdminEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_active: isActive } : e))
      );
      toast({
        title: "Actualizado",
        description: isActive ? "Correo activado." : "Correo desactivado.",
      });
    } catch (error) {
      console.error("Error toggling admin email:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const { error } = await supabase.from("admin_emails").delete().eq("id", id);

      if (error) throw error;

      setAdminEmails((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Eliminado", description: "Correo de administrador eliminado." });
    } catch (error) {
      console.error("Error deleting admin email:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el correo.",
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
          <h1 className="font-display text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Administra la configuración del sistema.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Correos de Notificación
            </CardTitle>
            <CardDescription>
              Administra los correos que recibirán notificaciones de nuevas citas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add new email form */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-email">Correo electrónico</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-name">Nombre (opcional)</Label>
                <Input
                  id="new-name"
                  type="text"
                  placeholder="Nombre del destinatario"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addEmail} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Agregar
                </Button>
              </div>
            </div>

            {/* Email list */}
            <div className="space-y-3">
              {adminEmails.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No hay correos de notificación configurados.
                </p>
              ) : (
                adminEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={email.is_active}
                        onCheckedChange={(checked) => toggleActive(email.id, checked)}
                      />
                      <div>
                        <p className={`font-medium ${!email.is_active ? "text-muted-foreground" : ""}`}>
                          {email.email}
                        </p>
                        {email.name && (
                          <p className="text-sm text-muted-foreground">{email.name}</p>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar correo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará {email.email} de la lista de notificaciones.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEmail(email.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Los correos activos recibirán notificaciones cada vez que un cliente agende una nueva cita.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

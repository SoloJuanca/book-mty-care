import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: "new_appointment" | "appointment_confirmed" | "appointment_cancelled";
  appointment: {
    client_name: string;
    client_email?: string;
    client_phone: string;
    client_address?: string;
    service: string;
    appointment_date: string;
    appointment_time: string;
  };
}

interface AdminEmail {
  email: string;
  name: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  rehabilitacion: "Rehabilitación Física",
  quiropraxia: "Quiropraxia",
  masajes_descontracturantes: "Masajes Descontracturantes",
  masajes_relajantes: "Masajes Relajantes",
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeStr: string): string => {
  return timeStr.slice(0, 5) + " hrs";
};

const generateClientEmail = (appointment: NotificationRequest["appointment"], type: NotificationRequest["type"]) => {
  const serviceName = SERVICE_LABELS[appointment.service] || appointment.service;
  const date = formatDate(appointment.appointment_date);
  const time = formatTime(appointment.appointment_time);

  if (type === "new_appointment") {
    return {
      subject: "¡Tu cita ha sido registrada! - Roberto Nieto Fisioterapia",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2a9d8f 0%, #287271 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Roberto Nieto</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Fisioterapia a Domicilio</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #2a9d8f; margin-top: 0;">¡Hola ${appointment.client_name}!</h2>
            
            <p>Tu solicitud de cita ha sido recibida. Te contactaremos pronto para confirmar.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2a9d8f;">
              <h3 style="margin-top: 0; color: #333;">Detalles de tu cita</h3>
              <p style="margin: 8px 0;"><strong>Servicio:</strong> ${serviceName}</p>
              <p style="margin: 8px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 8px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si tienes alguna pregunta, contáctanos por WhatsApp al <a href="https://wa.me/528443565667" style="color: #2a9d8f;">844 356 5667</a>
            </p>
          </div>
          
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            Roberto Nieto - Fisioterapia a Domicilio<br>
            Monterrey y Zona Metropolitana
          </p>
        </body>
        </html>
      `,
    };
  }

  if (type === "appointment_confirmed") {
    return {
      subject: "¡Tu cita ha sido confirmada! - Roberto Nieto Fisioterapia",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2a9d8f 0%, #287271 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Roberto Nieto</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Fisioterapia a Domicilio</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background: #d4edda; color: #155724; padding: 8px 16px; border-radius: 20px; font-weight: bold;">✓ Confirmada</span>
            </div>
            
            <h2 style="color: #2a9d8f; margin-top: 0; text-align: center;">¡Tu cita está confirmada!</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 8px 0;"><strong>Servicio:</strong> ${serviceName}</p>
              <p style="margin: 8px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 8px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            
            <p>Te esperamos en la fecha y hora indicada. Por favor ten lista el área donde se realizará la sesión.</p>
            
            <p style="color: #666; font-size: 14px;">
              ¿Necesitas reagendar? Contáctanos al <a href="https://wa.me/528443565667" style="color: #2a9d8f;">844 356 5667</a>
            </p>
          </div>
        </body>
        </html>
      `,
    };
  }

  // appointment_cancelled
  return {
    subject: "Tu cita ha sido cancelada - Roberto Nieto Fisioterapia",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2a9d8f 0%, #287271 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Roberto Nieto</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Fisioterapia a Domicilio</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #dc3545; margin-top: 0;">Cita Cancelada</h2>
          
          <p>Lamentamos informarte que tu cita ha sido cancelada:</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545; opacity: 0.8;">
            <p style="margin: 8px 0;"><strong>Servicio:</strong> ${serviceName}</p>
            <p style="margin: 8px 0;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Hora:</strong> ${time}</p>
          </div>
          
          <p>Puedes agendar una nueva cita en cualquier momento desde nuestra página.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://book-mty-care.lovable.app/reservar" style="background: #2a9d8f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Agendar Nueva Cita
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

const generateAdminEmail = (appointment: NotificationRequest["appointment"], type: NotificationRequest["type"]) => {
  const serviceName = SERVICE_LABELS[appointment.service] || appointment.service;
  const date = formatDate(appointment.appointment_date);
  const time = formatTime(appointment.appointment_time);

  return {
    subject: `Nueva solicitud de cita: ${appointment.client_name} - ${serviceName}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2a9d8f;">Nueva Solicitud de Cita</h2>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Datos del Cliente</h3>
          <p><strong>Nombre:</strong> ${appointment.client_name}</p>
          <p><strong>Teléfono:</strong> <a href="tel:${appointment.client_phone}">${appointment.client_phone}</a></p>
          ${appointment.client_email ? `<p><strong>Email:</strong> <a href="mailto:${appointment.client_email}">${appointment.client_email}</a></p>` : ""}
        </div>
        
        <div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de la Cita</h3>
          <p><strong>Servicio:</strong> ${serviceName}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        
        <p>
          <a href="https://book-mty-care.lovable.app/admin/citas" style="background: #2a9d8f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Ver en Panel Admin
          </a>
        </p>
      </body>
      </html>
    `,
  };
};

const getAdminEmails = async (): Promise<AdminEmail[]> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("admin_emails")
    .select("email, name")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching admin emails:", error);
    return [];
  }

  console.log("Fetched admin emails:", data?.length || 0);
  return data || [];
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    // Sender configuration (Brevo will only honor verified senders/domains)
    const SENDER_NAME = "Roberto Nieto Fisioterapia";
    const SENDER_EMAIL = "noreply@robertonieto.mx";
    console.log("Using sender:", { name: SENDER_NAME, email: SENDER_EMAIL });

    const { type, appointment }: NotificationRequest = await req.json();
    console.log("Notification request:", {
      type,
      appointment: { ...appointment, client_email: appointment.client_email ? "***" : undefined },
    });

    const results: { to: string; success: boolean; error?: string }[] = [];

    // Send email to client if they have an email
    if (appointment.client_email) {
      const clientEmail = generateClientEmail(appointment, type);
      console.log("Sending client email to:", appointment.client_email);

      const clientResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
          },
          to: [{ email: appointment.client_email, name: appointment.client_name }],
          subject: clientEmail.subject,
          htmlContent: clientEmail.htmlContent,
        }),
      });

      const clientResult = await clientResponse.json();
      console.log("Client email result:", clientResponse.status, clientResult);

      results.push({
        to: "client",
        success: clientResponse.ok,
        error: !clientResponse.ok ? JSON.stringify(clientResult) : undefined,
      });
    }

    // Send email to all active admins for new appointments
    if (type === "new_appointment") {
      const adminEmails = await getAdminEmails();
      console.log("Admin emails to notify:", adminEmails.map((e) => e.email));

      if (adminEmails.length > 0) {
        const adminEmailContent = generateAdminEmail(appointment, type);

        // Send to all admins
        for (const admin of adminEmails) {
          console.log("Sending admin email to:", admin.email);

          const adminResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
              sender: {
                name: "Sistema de Citas",
                email: SENDER_EMAIL,
              },
              to: [{ email: admin.email, name: admin.name || undefined }],
              subject: adminEmailContent.subject,
              htmlContent: adminEmailContent.htmlContent,
            }),
          });

          const adminResult = await adminResponse.json();
          console.log("Admin email result for", admin.email, ":", adminResponse.status, adminResult);

          results.push({
            to: `admin:${admin.email}`,
            success: adminResponse.ok,
            error: !adminResponse.ok ? JSON.stringify(adminResult) : undefined,
          });
        }
      } else {
        console.warn("No active admin emails configured");
      }
    }

    console.log("Notification results:", results);

    return new Response(JSON.stringify({ success: true, results, sender: { name: SENDER_NAME, email: SENDER_EMAIL } }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

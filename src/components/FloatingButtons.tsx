import { Phone, MessageCircle } from "lucide-react";

export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      <a
        href="https://wa.me/528112345678?text=Hola,%20quiero%20agendar%20una%20cita"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href="tel:+528112345678"
        className="btn-phone h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Llamar ahora"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}

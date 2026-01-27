import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">R</span>
              </div>
              <span className="font-display font-bold text-xl">Rehabs MTY</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Tu centro de rehabilitación y bienestar en Monterrey. Atención profesional y personalizada.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Servicios</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/rehabilitacion" className="hover:text-background transition-colors">Rehabilitación Física</Link></li>
              <li><Link to="/quiropraxia" className="hover:text-background transition-colors">Quiropraxia</Link></li>
              <li><Link to="/masajes-descontracturantes" className="hover:text-background transition-colors">Masajes Descontracturantes</Link></li>
              <li><Link to="/masajes-relajantes" className="hover:text-background transition-colors">Masajes Relajantes</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Contacto</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Av. Constitución #123, Col. Centro, Monterrey, N.L.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+528112345678" className="hover:text-background transition-colors">81 1234 5678</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:contacto@rehabsmty.com" className="hover:text-background transition-colors">contacto@rehabsmty.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Horarios</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Lun - Vie: 9:00 - 19:00</span>
              </li>
              <li className="pl-6">Sábado: 9:00 - 14:00</li>
              <li className="pl-6">Domingo: Cerrado</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Rehabs MTY. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-sm text-background/50">
            <Link to="/admin" className="hover:text-background transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

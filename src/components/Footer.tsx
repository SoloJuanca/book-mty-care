import { Link } from "react-router-dom";
import { Phone, Mail, Clock, Home, Instagram, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Roberto Nieto - Fisioterapia" className="h-12 brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed">
              Fisioterapeuta profesional con atención a domicilio en Monterrey y Zona Metropolitana. 9 años de
              experiencia.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Servicios</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/rehabilitacion" className="hover:text-background transition-colors">
                  Rehabilitación Física
                </Link>
              </li>
              <li>
                <Link to="/quiropraxia" className="hover:text-background transition-colors">
                  Quiropraxia
                </Link>
              </li>
              <li>
                <Link to="/masajes-descontracturantes" className="hover:text-background transition-colors">
                  Masajes Descontracturantes
                </Link>
              </li>
              <li>
                <Link to="/masajes-relajantes" className="hover:text-background transition-colors">
                  Masajes Relajantes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Contacto</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <Home className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Servicio a domicilio en Monterrey y Zona Metropolitana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+528112411746" className="hover:text-background transition-colors">
                  81 1241 1746
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:contacto@robertonieto.com" className="hover:text-background transition-colors">
                  contacto@robertonieto.com
                </a>
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
            © {new Date().getFullYear()} Rehabs MTY | Roberto Nieto. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/roberto.fisio1?igsh=NWxrcWR0a3UxanIy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/50 hover:text-background transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/share/1GfLhj8iVf/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/50 hover:text-background transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <Link to="/admin" className="text-sm text-background/50 hover:text-background transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

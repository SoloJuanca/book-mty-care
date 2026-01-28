import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import isotipo from "@/assets/isotipo.png";

const navLinks = [
  { href: "/rehabilitacion", label: "Rehabilitación" },
  { href: "/quiropraxia", label: "Quiropraxia" },
  { href: "/masajes-descontracturantes", label: "Masajes Descontracturantes" },
  { href: "/masajes-relajantes", label: "Masajes Relajantes" },
];

export function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, isAdmin } = useAuth();

  const accountLink = isAdmin ? "/admin/citas" : user ? "/mi-cuenta" : "/cuenta";
  const accountLabel = isAdmin ? "Admin" : user ? "Mi Cuenta" : "Mi Cuenta";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Roberto Nieto - Fisioterapia" className="h-10 hidden sm:block" />
          <img src={isotipo} alt="Roberto Nieto" className="h-10 sm:hidden" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="tel:+528443565667" className="hidden sm:flex">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">844 356 5667</span>
            </Button>
          </a>
          <Link to={accountLink} className="hidden sm:flex">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{accountLabel}</span>
            </Button>
          </Link>
          <Link to="/reservar">
            <Button size="sm" className="font-semibold">
              Reservar Cita
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="lg:hidden border-t border-border bg-background py-4 animate-fade-in">
          <div className="container flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={accountLink}
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              {accountLabel}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

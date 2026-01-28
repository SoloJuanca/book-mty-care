import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, LogOut, Menu, X, Loader2, Star, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import isotipo from "@/assets/isotipo.png";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/admin/citas", label: "Citas", icon: Calendar },
  { href: "/admin/disponibilidad", label: "Disponibilidad", icon: Settings },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/admin");
    return null;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-6">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Ir al inicio
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-background border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={isotipo} alt="Roberto Nieto" className="h-8" />
          <span className="font-display font-bold">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-background border-r border-border transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b border-border">
              <img src={isotipo} alt="Roberto Nieto" className="h-9" />
              <div>
                <span className="font-display font-bold">Roberto Nieto</span>
                <p className="text-xs text-muted-foreground">Panel Admin</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Ver sitio
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

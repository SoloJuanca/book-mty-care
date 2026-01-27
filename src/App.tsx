import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import ServicePage from "./pages/ServicePage";
import BookingPage from "./pages/BookingPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminAvailability from "./pages/admin/AdminAvailability";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rehabilitacion" element={<ServicePage />} />
            <Route path="/quiropraxia" element={<ServicePage />} />
            <Route path="/masajes-descontracturantes" element={<ServicePage />} />
            <Route path="/masajes-relajantes" element={<ServicePage />} />
            <Route path="/reservar" element={<BookingPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/citas" element={<AdminAppointments />} />
            <Route path="/admin/disponibilidad" element={<AdminAvailability />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

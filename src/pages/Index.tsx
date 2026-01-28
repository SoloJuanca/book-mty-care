import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/services";
import { CheckCircle2, Home, Award, Users, ArrowRight } from "lucide-react";

const testimonials = [
  {
    name: "María García",
    location: "San Pedro Garza García",
    text: "Después de mi cirugía de rodilla, la rehabilitación en Rehabs MTY fue fundamental para mi recuperación. El equipo es muy profesional y atento.",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    location: "Monterrey Centro",
    text: "Llevaba años con dolor de espalda. Con las sesiones de quiropraxia finalmente encontré alivio. Totalmente recomendado.",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    location: "Guadalupe, N.L.",
    text: "Los masajes descontracturantes son excelentes. El ambiente es muy relajante y el terapeuta muy profesional. Volveré pronto.",
    rating: 5,
  },
];

const locations = ["Monterrey", "San Pedro", "Guadalupe", "Apodaca", "San Nicolás", "Santa Catarina", "Escobedo"];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-[0.03]" />
        <div className="container section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Home className="h-4 w-4" />
              <span>Atención a domicilio en Monterrey y Zona Metropolitana</span>
            </div>
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Tu bienestar físico <span className="text-gradient">comienza aquí</span>
            </h1>
            <p
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Fisioterapia y rehabilitación a domicilio en Monterrey. Tratamientos personalizados para recuperar tu
              movilidad y mejorar tu calidad de vida.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to="/reservar">
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2">
                  Reservar Cita <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+528443565667">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
                  Llamar Ahora
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-display font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Pacientes Atendidos</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-display font-bold text-primary">9</div>
              <div className="text-sm text-muted-foreground">Años de Experiencia</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-display font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-display font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Atención Personalizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos una gama completa de servicios de rehabilitación y bienestar adaptados a tus necesidades
              específicas.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.shortDescription}
                icon={service.icon}
                href={`/${service.slug}`}
                duration={service.duration}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">¿Por qué elegir Rehabs MTY?</h2>
              <p className="text-muted-foreground mb-8">
                Somos un equipo de profesionales comprometidos con tu recuperación y bienestar. Combinamos experiencia,
                tecnología y un trato personalizado.
              </p>
              <ul className="space-y-4">
                {[
                  "Fisioterapeuta certificado con 9 años de experiencia",
                  "Equipamiento portátil y técnicas actualizadas",
                  "Planes de tratamiento personalizados",
                  "Atención en la comodidad de tu hogar",
                  "Servicio a domicilio en toda la Zona Metropolitana",
                  "Horarios flexibles para tu comodidad",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-card border border-border card-elevated">
                  <Award className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-1">Certificados</h3>
                  <p className="text-sm text-muted-foreground">
                    Personal con certificaciones nacionales e internacionales
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-primary text-primary-foreground">
                  <Users className="h-8 w-8 mb-3" />
                  <h3 className="font-display font-semibold mb-1">Atención Personal</h3>
                  <p className="text-sm opacity-90">Cada paciente recibe atención individualizada</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="p-6 rounded-xl bg-card border border-border card-elevated">
                  <Home className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-1">A Domicilio</h3>
                  <p className="text-sm text-muted-foreground">Atención en la comodidad de tu hogar</p>
                </div>
                <div className="p-6 rounded-xl bg-secondary">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-1">Resultados</h3>
                  <p className="text-sm text-muted-foreground">Enfoque en resultados medibles y duraderos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Lo que dicen nuestros pacientes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              La satisfacción de nuestros pacientes es nuestra mejor carta de presentación.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="section-padding bg-muted/30">
        <div className="container text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            Servicio a Domicilio en toda la Zona Metropolitana
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Llevo mi equipo profesional directamente a tu hogar. Atención personalizada sin necesidad de desplazarte.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {locations.map((location) => (
              <span key={location} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium">
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl hero-gradient text-primary-foreground">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">¿Listo para sentirte mejor?</h2>
            <p className="opacity-90 mb-8 max-w-xl mx-auto">
              Agenda tu cita hoy y da el primer paso hacia una vida sin dolor. Nuestro equipo te está esperando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reservar">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
                  Reservar Cita Ahora
                </Button>
              </Link>
              <a href="https://wa.me/528443565667" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto font-semibold border-primary-foreground/30 text-primary hover:bg-primary-foreground/10"
                >
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getServiceBySlug, services } from "@/lib/services";
import { CheckCircle2, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return <Navigate to="/404" replace />;
  }

  const otherServices = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <Layout>
      <Helmet>
        <title>{service.metaTitle}</title>
        <meta name="description" content={service.metaDescription} />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-[0.03]" />
        <div className="container section-padding">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Duración: {service.duration}</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              {service.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {service.description}
            </p>
            <Link to={`/reservar?servicio=${service.id}`}>
              <Button size="lg" className="font-semibold gap-2">
                Reservar {service.title} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits & Conditions */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">
                Beneficios del tratamiento
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">
                Condiciones que tratamos
              </h2>
              <ul className="space-y-4">
                {service.conditions.map((condition, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              ¿Listo para comenzar tu tratamiento?
            </h2>
            <p className="text-muted-foreground mb-8">
              Agenda tu cita de {service.title.toLowerCase()} hoy. Nuestro equipo te atenderá de manera profesional y personalizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/reservar?servicio=${service.id}`}>
                <Button size="lg" className="w-full sm:w-auto font-semibold">
                  Reservar Cita
                </Button>
              </Link>
              <a href="tel:+528112345678">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
                  Llamar: 81 1234 5678
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="section-padding">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">
            Otros servicios que ofrecemos
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {otherServices.map((s) => (
              <Link
                key={s.id}
                to={`/${s.slug}`}
                className="group p-6 rounded-xl bg-card border border-border card-elevated"
              >
                <div className="h-10 w-10 rounded-lg hero-gradient flex items-center justify-center mb-4">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {s.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

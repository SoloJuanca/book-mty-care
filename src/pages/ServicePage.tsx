import { useLocation, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getServiceBySlug, services, metropolitanAreas } from "@/lib/services";
import { CheckCircle2, Clock, ArrowRight, ArrowLeft, MapPin, Phone, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ServicePage() {
  const location = useLocation();
  const slug = location.pathname.replace("/", "");
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/404" replace />;
  }

  const otherServices = services.filter((s) => s.id !== service.id).slice(0, 3);

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Person",
      name: "Roberto Nieto",
      jobTitle: "Fisioterapeuta",
      areaServed: metropolitanAreas.map((area) => ({
        "@type": "City",
        name: area,
        containedInPlace: {
          "@type": "State",
          name: "Nuevo León",
          containedInPlace: {
            "@type": "Country",
            name: "México",
          },
        },
      })),
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 25.6866,
        longitude: -100.3161,
      },
      geoRadius: "50000",
    },
    serviceType: service.title,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceLocation: {
        "@type": "Place",
        name: "Servicio a domicilio",
      },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqItems?.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Layout>
      <Helmet>
        <title>{service.metaTitle}</title>
        <meta name="description" content={service.metaDescription} />
        <meta name="keywords" content={`${service.title.toLowerCase()}, fisioterapia monterrey, ${service.conditions?.join(", ").toLowerCase()}, a domicilio monterrey`} />
        <link rel="canonical" href={`https://robertonietoft.com/${service.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        {service.faqItems && (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        )}
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
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="h-4 w-4" />
                Duración: {service.duration}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <MapPin className="h-4 w-4" />
                A domicilio en Monterrey
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              {service.title} a Domicilio en Monterrey
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{service.description}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={`/reservar?servicio=${service.id}`}>
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2">
                  Reservar {service.title} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+528442565667">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold gap-2">
                  <Phone className="h-4 w-4" />
                  84 42 56 56 67
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Conditions */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">Beneficios del tratamiento</h2>
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
              <h2 className="font-display text-2xl font-bold mb-6">Condiciones que tratamos</h2>
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

      {/* Common Problems Section */}
      {service.commonProblems && (
        <section className="section-padding bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                Problemas Comunes que Tratamos en Monterrey
              </h2>
              <p className="text-muted-foreground">
                Estos son algunos de los padecimientos más frecuentes que tratamos con {service.title.toLowerCase()} en la zona metropolitana de Monterrey.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {service.commonProblems.map((problem, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <h3 className="font-display font-semibold text-lg mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coverage Area */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">
              Cobertura en Monterrey y Zona Metropolitana
            </h2>
            <p className="text-muted-foreground">
              Llevamos nuestros servicios de {service.title.toLowerCase()} directamente a tu domicilio en:
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {metropolitanAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium border border-primary/20"
              >
                <MapPin className="h-3.5 w-3.5" />
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {service.faqItems && (
        <section className="section-padding bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <HelpCircle className="h-4 w-4" />
                  Preguntas Frecuentes
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  Dudas sobre {service.title}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {service.faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              ¿Listo para comenzar tu tratamiento de {service.title}?
            </h2>
            <p className="text-muted-foreground mb-8">
              Agenda tu cita de {service.title.toLowerCase()} a domicilio hoy. Roberto Nieto te atenderá de manera profesional y personalizada en la comodidad de tu hogar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/reservar?servicio=${service.id}`}>
                <Button size="lg" className="w-full sm:w-auto font-semibold">
                  Reservar Cita
                </Button>
              </Link>
              <a href="tel:+528442565667">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
                  Llamar: 84 42 56 56 67
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">Otros servicios que ofrecemos</h2>
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
                <p className="text-sm text-muted-foreground line-clamp-2">{s.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
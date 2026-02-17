import robertoImg from "@/assets/roberto-nieto.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Stethoscope, Heart } from "lucide-react";

export function AboutSection() {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={robertoImg}
                alt="Roberto Nieto - Fisioterapeuta profesional en Monterrey"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 p-4 rounded-xl bg-primary text-primary-foreground shadow-lg hidden sm:block">
              <p className="font-display font-bold text-2xl">9+</p>
              <p className="text-sm opacity-90">Años de experiencia</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Conoce a <span className="text-gradient">Roberto Nieto</span>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Soy Roberto Nieto, fisioterapeuta certificado con más de 9 años de experiencia en rehabilitación física y terapia manual. Mi pasión es ayudar a mis pacientes a recuperar su movilidad y mejorar su calidad de vida desde la comodidad de su hogar.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Me especializo en rehabilitación musculoesquelética, quiropraxia y terapias de relajación. Cada plan de tratamiento que diseño es único, adaptado a las necesidades y objetivos de cada paciente, utilizando técnicas actualizadas y equipo portátil profesional.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Certificado</p>
                  <p className="text-xs text-muted-foreground">Formación profesional continua</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">200+ Pacientes</p>
                  <p className="text-xs text-muted-foreground">Atendidos exitosamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">A Domicilio</p>
                  <p className="text-xs text-muted-foreground">En toda la zona metropolitana</p>
                </div>
              </div>
            </div>

            <Link to="/reservar">
              <Button size="lg" className="font-semibold gap-2">
                Agenda tu Cita <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Activity, Bone, Sparkles, Heart } from "lucide-react";

export const services = [
  {
    id: "rehabilitacion",
    slug: "rehabilitacion",
    title: "Rehabilitación Física",
    shortDescription: "Recuperación funcional profesional para lesiones y padecimientos musculoesqueléticos.",
    description: "Nuestro programa de rehabilitación física está diseñado para ayudarte a recuperar tu movilidad y funcionalidad después de lesiones, cirugías o padecimientos crónicos. Utilizamos técnicas avanzadas y equipamiento especializado para acelerar tu recuperación.",
    icon: Activity,
    duration: "60 min",
    benefits: [
      "Evaluación personalizada de tu condición",
      "Plan de tratamiento individualizado",
      "Técnicas manuales y terapia física",
      "Ejercicios de fortalecimiento y flexibilidad",
      "Seguimiento continuo de tu progreso",
    ],
    conditions: [
      "Lesiones deportivas",
      "Post-operatorio",
      "Dolor de espalda y cuello",
      "Artritis y artrosis",
      "Hernias discales",
    ],
    metaTitle: "Rehabilitación Física en Monterrey | Rehabs MTY",
    metaDescription: "Rehabilitación física profesional en Monterrey y zona metropolitana. Recupera tu movilidad con tratamientos personalizados. Agenda tu cita hoy.",
  },
  {
    id: "quiropraxia",
    slug: "quiropraxia",
    title: "Quiropraxia",
    shortDescription: "Ajustes quiroprácticos para aliviar dolor y mejorar la función del sistema nervioso.",
    description: "La quiropraxia es una disciplina de la salud que se enfoca en el diagnóstico, tratamiento y prevención de trastornos del sistema músculo-esquelético, especialmente de la columna vertebral. Mediante ajustes precisos, mejoramos tu bienestar general.",
    icon: Bone,
    duration: "45 min",
    benefits: [
      "Alivio del dolor de espalda y cuello",
      "Mejora de la postura",
      "Mayor rango de movimiento",
      "Reducción de dolores de cabeza",
      "Mejora del sistema nervioso",
    ],
    conditions: [
      "Dolor lumbar crónico",
      "Ciática",
      "Dolor cervical",
      "Migrañas y cefaleas",
      "Problemas posturales",
    ],
    metaTitle: "Quiropraxia en Monterrey | Ajustes Quiroprácticos | Rehabs MTY",
    metaDescription: "Tratamiento quiropráctico profesional en Monterrey. Alivia dolor de espalda, cuello y mejora tu postura. Quiroprácticos certificados.",
  },
  {
    id: "masajes_descontracturantes",
    slug: "masajes-descontracturantes",
    title: "Masajes Descontracturantes",
    shortDescription: "Técnicas profundas para liberar tensión muscular y contracturas.",
    description: "El masaje descontracturante es una técnica terapéutica profunda que trabaja sobre los tejidos musculares para liberar la tensión acumulada, disolver contracturas y mejorar la circulación sanguínea. Ideal para quienes sufren de estrés o trabajo físico intenso.",
    icon: Sparkles,
    duration: "60 min",
    benefits: [
      "Liberación de contracturas musculares",
      "Reducción del estrés y ansiedad",
      "Mejora de la circulación sanguínea",
      "Alivio de dolor muscular",
      "Mayor flexibilidad",
    ],
    conditions: [
      "Contracturas musculares",
      "Tensión por estrés",
      "Rigidez muscular",
      "Dolor de hombros y cuello",
      "Fatiga muscular",
    ],
    metaTitle: "Masajes Descontracturantes en Monterrey | Rehabs MTY",
    metaDescription: "Masajes descontracturantes profesionales en Monterrey. Libera tensión muscular y contracturas con técnicas especializadas. Reserva ahora.",
  },
  {
    id: "masajes_relajantes",
    slug: "masajes-relajantes",
    title: "Masajes Relajantes",
    shortDescription: "Experiencia de relajación profunda para cuerpo y mente.",
    description: "Nuestro masaje relajante combina técnicas suaves y movimientos fluidos para proporcionar una experiencia de bienestar integral. Perfecto para reducir el estrés, mejorar el sueño y reconectar con tu cuerpo en un ambiente de tranquilidad.",
    icon: Heart,
    duration: "60 min",
    benefits: [
      "Relajación profunda del cuerpo",
      "Reducción del estrés y ansiedad",
      "Mejora de la calidad del sueño",
      "Sensación de bienestar general",
      "Alivio de tensión emocional",
    ],
    conditions: [
      "Estrés crónico",
      "Insomnio",
      "Ansiedad",
      "Fatiga mental",
      "Tensión general",
    ],
    metaTitle: "Masajes Relajantes en Monterrey | Bienestar Integral | Rehabs MTY",
    metaDescription: "Masajes relajantes en Monterrey para reducir estrés y mejorar tu bienestar. Ambiente tranquilo y terapeutas profesionales. Agenda hoy.",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getServiceById(id: string) {
  return services.find((s) => s.id === id);
}

export interface EventCategory {
  value: string;
  label: string;
  description: string;
  accent: string;
  accentSoft: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    value: 'Música y Festivales',
    label: 'Música y Festivales',
    description: 'Recitales íntimos, festivales al aire libre y sesiones DJ para vibrar con cada beat.',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.15)',
  },
  {
    value: 'Tecnología & Startups',
    label: 'Tecnología & Startups',
    description: 'Conferencias, hackathons y encuentros makers para anticipar el futuro digital.',
    accent: '#818cf8',
    accentSoft: 'rgba(129, 140, 248, 0.18)',
  },
  {
    value: 'Arte & Cultura',
    label: 'Arte & Cultura',
    description: 'Muestras, ciclos de cine, teatro independiente y experiencias inmersivas.',
    accent: '#f472b6',
    accentSoft: 'rgba(244, 114, 182, 0.18)',
  },
  {
    value: 'Deportes & Fitness',
    label: 'Deportes & Fitness',
    description: 'Carreras urbanas, clases funcionales, torneos amateurs y bienestar activo.',
    accent: '#34d399',
    accentSoft: 'rgba(52, 211, 153, 0.18)',
  },
  {
    value: 'Gastronomía & Bebidas',
    label: 'Gastronomía & Bebidas',
    description: 'Catas, ferias gastronómicas, experiencias gourmet y rutas cerveceras.',
    accent: '#fbbf24',
    accentSoft: 'rgba(251, 191, 36, 0.18)',
  },
  {
    value: 'Educación & Workshops',
    label: 'Educación & Workshops',
    description: 'Talleres prácticos, charlas inspiradoras y programas de formación continua.',
    accent: '#2dd4bf',
    accentSoft: 'rgba(45, 212, 191, 0.18)',
  },
  {
    value: 'Bienestar & Lifestyle',
    label: 'Bienestar & Lifestyle',
    description: 'Meditación, yoga, diseño de hábitos y experiencias para reconectar con vos.',
    accent: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.18)',
  },
  {
    value: 'Solidario & Comunidad',
    label: 'Solidario & Comunidad',
    description: 'Encuentros colaborativos, voluntariados y acciones con impacto social.',
    accent: '#60a5fa',
    accentSoft: 'rgba(96, 165, 250, 0.18)',
  },
];

export const EVENT_CATEGORY_LOOKUP: Record<string, EventCategory> = EVENT_CATEGORIES.reduce(
  (acc, category) => ({ ...acc, [category.value]: category }),
  {}
);

EVENT_CATEGORY_LOOKUP['Music'] = EVENT_CATEGORIES[0];
EVENT_CATEGORY_LOOKUP['Sports'] = EVENT_CATEGORIES[3];
EVENT_CATEGORY_LOOKUP['Tech'] = EVENT_CATEGORIES[1];

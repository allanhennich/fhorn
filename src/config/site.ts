export const siteConfig = {
  name: 'F.Horn Self Storage',
  shortName: 'F.Horn',
  description: 'Soluções de guarda móveis e self storage em Florianópolis para você e sua empresa.',
  url: 'https://www.fhorn.com.br',
  locale: 'pt-BR',

  contact: {
    phone: '(48) 3380-0272',
    phoneRaw: '554833800272',
    whatsapp: '+55 48 3380-0272',
    whatsappRaw: '554833800272',
    instagram: '@f.hornselfstorage',
    instagramUrl: 'https://www.instagram.com/f.hornselfstorage/',
    linkedinUrl: 'https://www.linkedin.com/company/f-horn/',
    email: '', // a definir
  },

  address: {
    street: 'Rua Fermino Costa, 186',
    neighborhood: 'Capoeiras',
    city: 'Florianópolis',
    state: 'SC',
    stateFullName: 'Santa Catarina',
    zip: '88085-030',
    country: 'BR',
    full: 'Rua Fermino Costa, 186 - Capoeiras, Florianópolis - SC, 88085-030',
    googleMapsUrl: '', // a definir
  },

  business: {
    foundedYear: undefined, // a confirmar
    cnpj: '', // a definir
    openingHours: '', // a definir
  },

  social: {
    instagram: 'https://www.instagram.com/f.hornselfstorage/',
    linkedin: 'https://www.linkedin.com/company/f-horn/',
    facebook: '', // a definir
  },

  seo: {
    titleTemplate: '%s | F.Horn Self Storage',
    defaultTitle: 'F.Horn Self Storage | Guarda Móveis e Self Storage em Florianópolis',
    defaultDescription: 'Guarda móveis e self storage em Florianópolis. Espaços seguros e flexíveis para armazenar seus pertences pessoais ou estoque empresarial.',
    defaultImage: '/images/og-default.jpg',
  },

  /** Margem de segurança aplicada ao volume calculado (1.3 = 30%) */
  calculatorMargin: 1.3,
} as const;

export type SiteConfig = typeof siteConfig;

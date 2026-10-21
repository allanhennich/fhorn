export interface NavItem {
  label: string;
  href: string;
  isButton?: boolean;
}

export const mainNavigation: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Como funciona', href: '/como-funciona/' },
  { label: 'Nossos espaços', href: '/boxes/' },
  { label: 'Para você', href: '/guarda-moveis-florianopolis/' },
  { label: 'Para empresas', href: '/self-storage-para-empresas/' },
  { label: 'Sobre nós', href: '/sobre/' },
  { label: 'Contato', href: '/contato/' },
];

export const ctaNavItem: NavItem = {
  label: 'Solicitar orçamento',
  href: '/contato/',
  isButton: true,
};

export const footerNavigation = {
  services: [
    { label: 'Guarda Móveis', href: '/guarda-moveis-florianopolis/' },
    { label: 'Self Storage Empresas', href: '/self-storage-para-empresas/' },
    { label: 'Armazenamento de Estoque', href: '/armazenamento-de-estoque/' },
    { label: 'Guarda Documentos', href: '/guarda-documentos/' },
    { label: 'Self Storage Florianópolis', href: '/self-storage-florianopolis/' },
    { label: 'Alugar Box', href: '/alugar-box-florianopolis/' },
    { label: 'Guarda Volumes', href: '/guarda-volumes-florianopolis/' },
    { label: 'Mudança', href: '/mudanca-florianopolis/' },
    { label: 'Reforma', href: '/reforma-florianopolis/' },
    { label: 'Depósito', href: '/deposito-florianopolis/' },
    { label: 'Simulador de Espaço', href: '/simulador-de-espaco/' },
  ],
  boxes: [
    { label: 'Box 3m³', href: '/boxes/mini/' },
    { label: 'Box 5m³', href: '/boxes/box-p/' },
    { label: 'Box 7m³', href: '/boxes/box-m/' },
    { label: 'Box 8m³', href: '/boxes/box-m-plus/' },
    { label: 'Box 9m³', href: '/boxes/box-g/' },
    { label: 'Box 10m³', href: '/boxes/box-gg/' },
    { label: 'Box 11m³', href: '/boxes/box-xg/' },
  ],
  institutional: [
    { label: 'Sobre a F.Horn', href: '/sobre/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Contato', href: '/contato/' },
    { label: 'Política de Privacidade', href: '/politica-de-privacidade/' },
    { label: 'Termos de Uso', href: '/termos-de-uso/' },
    { label: 'Cookies', href: '/cookies/' },
  ],
};

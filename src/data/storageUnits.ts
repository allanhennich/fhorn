/**
 * F.Horn Self Storage — categorias de box (da menor para a maior).
 * Fonte das medidas: planilha "Tabela_Box_e_Metragens.xlsx".
 * 8 categorias agrupadas por dimensões físicas reais do prédio.
 *
 * Convenção: L × A × P = Largura × Altura × Profundidade (comprimento), em metros.
 * Imagens: public/images/boxes/<arquivo>.webp + .png fallback.
 */

export interface StorageUnitDimensions {
  /** Largura (L), em metros */
  width: number;
  /** Altura (A), em metros */
  height: number;
  /** Profundidade / comprimento (P), em metros */
  depth: number;
}

export interface StorageUnitImage {
  src: string;
  fallback: string;
  width: number;
  height: number;
  alt: string;
}

export interface StorageUnit {
  id: number;
  name: string;
  slug: string;
  /** Volume comercial em m³ */
  volume: number;
  /** Volume formatado, ex.: "3 m³" */
  volumeLabel: string;
  dimensions: StorageUnitDimensions;
  /** Formato L × A × P, ex.: "1,00 × 1,40 × 2,08 m" */
  dimensionLabel: string;
  image: StorageUnitImage;
  description: string;
  sampleItems: string[];
  isDemonstrative: true;
}

const IMG_SIZE = 1080;

const img = (file: string, alt: string): StorageUnitImage => ({
  src: `/images/boxes/${file}.webp`,
  fallback: `/images/boxes/${file}.png`,
  width: IMG_SIZE,
  height: IMG_SIZE,
  alt,
});

export const storageUnits: StorageUnit[] = [
  // ── Subsolo 2 Direito — pé-direito baixo, padrão ─────────────────
  {
    id: 1,
    name: "Mini",
    slug: "mini",
    volume: 3,
    volumeLabel: "3 m³",
    dimensions: { width: 1.00, height: 1.40, depth: 2.08 },
    dimensionLabel: "1,00 × 1,40 × 2,08 m",
    image: img(
      "mini-2-9m3",
      "Box Mini da F.Horn Self Storage, 3 m³ — 1,00 × 1,40 × 2,08 m",
    ),
    description:
      "Ideal para poucos itens: caixas, malas e objetos sazonais guardados com segurança.",
    sampleItems: ["Caixas de papelão", "Malas de viagem", "Caixas organizadoras", "Roupas e itens sazonais"],
    isDemonstrative: true,
  },
  // ── Subsolo 2 Esquerdo — pé-direito baixo, profundo ───────────────
  {
    id: 2,
    name: "Mini+",
    slug: "mini-plus",
    volume: 3.5,
    volumeLabel: "3,5 m³",
    dimensions: { width: 0.85, height: 1.39, depth: 2.99 },
    dimensionLabel: "0,85 × 1,39 × 2,99 m",
    image: img(
      "mini-2-9m3",
      "Box Mini+ da F.Horn Self Storage, 3,5 m³ — 0,85 × 1,39 × 2,99 m",
    ),
    description:
      "Estreito e profundo: ótimo para caixas compridas, equipamentos esportivos e itens sazonais.",
    sampleItems: ["Caixas compridas", "Equipamentos esportivos", "Pranchas", "Itens sazonais"],
    isDemonstrative: true,
  },
  // ── Subsolo 2 Direito — pé-direito baixo, duplo ───────────────────
  {
    id: 3,
    name: "Box P",
    slug: "box-p",
    volume: 5,
    volumeLabel: "5 m³",
    dimensions: { width: 1.73, height: 1.40, depth: 2.07 },
    dimensionLabel: "1,73 × 1,40 × 2,07 m",
    image: img(
      "box-p-5m3",
      "Box P da F.Horn Self Storage, 5 m³ — 1,73 × 1,40 × 2,07 m",
    ),
    description:
      "Mais espaço para o dia a dia: caixas, malas, cadeiras dobráveis e pequenos itens domésticos.",
    sampleItems: ["Caixas de papelão", "Malas", "Cadeiras dobráveis", "Estante pequena", "Caixas organizadoras"],
    isDemonstrative: true,
  },
  // ── Térreo D / Subsolo 1 D — pé-direito alto, estreito ────────────
  {
    id: 4,
    name: "Box M",
    slug: "box-m",
    volume: 7.5,
    volumeLabel: "7,5 m³",
    dimensions: { width: 1.01, height: 2.88, depth: 2.60 },
    dimensionLabel: "1,01 × 2,88 × 2,60 m",
    image: img(
      "box-m-7-5m3",
      "Box M da F.Horn Self Storage, 7,5 m³ — 1,01 × 2,88 × 2,60 m",
    ),
    description:
      "Pé-direito alto para empilhar com organização: perfeito para itens de mudança, reformas e acervos.",
    sampleItems: ["Caixas empilhadas", "Prateleira de aço", "Cadeiras", "Mesa desmontada", "Itens de mudança"],
    isDemonstrative: true,
  },
  // ── 1º Andar D / variantes largas — pé-direito alto, largo ────────
  {
    id: 5,
    name: "Box M+",
    slug: "box-m-plus",
    volume: 8.5,
    volumeLabel: "8,5 m³",
    dimensions: { width: 1.20, height: 2.89, depth: 2.50 },
    dimensionLabel: "1,20 × 2,89 × 2,50 m",
    image: img(
      "box-m-7-5m3",
      "Box M+ da F.Horn Self Storage, 8,5 m³ — 1,20 × 2,89 × 2,50 m",
    ),
    description:
      "Largura extra com pé-direito alto: acomoda móveis médios e eletrodomésticos com folga.",
    sampleItems: ["Sofá pequeno", "Cômoda", "Eletrodomésticos", "Caixas empilhadas", "Bicicleta"],
    isDemonstrative: true,
  },
  // ── T/E, 1ºA/E, 1ºS/E — pé-direito alto, profundo, estreito ─────
  {
    id: 6,
    name: "Box G",
    slug: "box-g",
    volume: 9,
    volumeLabel: "9 m³",
    dimensions: { width: 1.05, height: 2.88, depth: 2.97 },
    dimensionLabel: "1,05 × 2,88 × 2,97 m",
    image: img(
      "box-g-9m3",
      "Box G da F.Horn Self Storage, 9 m³ — 1,05 × 2,88 × 2,97 m",
    ),
    description:
      "Profundo e alto: espaço para bicicleta, home office, armário e caixas no mesmo lugar.",
    sampleItems: ["Caixas", "Bicicleta", "Cadeira de escritório", "Armário pequeno", "Frigobar"],
    isDemonstrative: true,
  },
  // ── T/E, 1ºA/E, 1ºS/E — pé-direito alto, profundo, médio ────────
  {
    id: 7,
    name: "Box GG",
    slug: "box-gg",
    volume: 10,
    volumeLabel: "10 m³",
    dimensions: { width: 1.15, height: 2.88, depth: 2.97 },
    dimensionLabel: "1,15 × 2,88 × 2,97 m",
    image: img(
      "box-gg-11-7m3",
      "Box GG da F.Horn Self Storage, 10 m³ — 1,15 × 2,88 × 2,97 m",
    ),
    description:
      "Amplo e profundo: para mudanças parciais, estoque comercial e móveis maiores.",
    sampleItems: ["Guarda-roupa", "Cama de casal desmontada", "Caixas grandes", "Estoque comercial"],
    isDemonstrative: true,
  },
  // ── T/E, 1ºA/E, 1ºS/E — pé-direito alto, profundo, largo ────────
  {
    id: 8,
    name: "Box XG",
    slug: "box-xg",
    volume: 11,
    volumeLabel: "11 m³",
    dimensions: { width: 1.30, height: 2.89, depth: 2.97 },
    dimensionLabel: "1,30 × 2,89 × 2,97 m",
    image: img(
      "box-gg-11-7m3",
      "Box XG da F.Horn Self Storage, 11 m³ — 1,30 × 2,89 × 2,97 m",
    ),
    description:
      "O maior box da F.Horn: comporta geladeira, máquina de lavar, bicicleta, colchão e caixas de uma mudança.",
    sampleItems: ["Geladeira", "Máquina de lavar", "Bicicleta", "Colchão / painéis", "Caixas grandes", "Malas"],
    isDemonstrative: true,
  },
];

/** Área de piso em m² (L × P) */
export const floorArea = (u: StorageUnit) =>
  Math.round(u.dimensions.width * u.dimensions.depth * 100) / 100;

export const formatMeters = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function getUnitBySlug(slug: string): StorageUnit | undefined {
  return storageUnits.find((u) => u.slug === slug);
}

export function getUnitById(id: number): StorageUnit | undefined {
  return storageUnits.find((u) => u.id === id);
}

export function formatDimensions(unit: StorageUnit): string {
  return unit.dimensionLabel;
}

export function formatVolume(volume: number): string {
  return `${volume} m³`;
}

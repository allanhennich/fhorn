export interface CalculatorItem {
  id: string;
  name: string;
  category: CalculatorCategory;
  /** Largura em metros */
  width: number;
  /** Altura em metros */
  height: number;
  /** Profundidade em metros */
  depth: number;
  /** Volume unitário em m³ */
  volume: number;
  /** Pode ser empilhado? */
  stackable: boolean;
  icon?: string;
}

export type CalculatorCategory = 'sala' | 'quarto' | 'cozinha' | 'escritorio' | 'diversos';

export const categoryLabels: Record<CalculatorCategory, string> = {
  sala: 'Sala',
  quarto: 'Quarto',
  cozinha: 'Cozinha',
  escritorio: 'Escritório',
  diversos: 'Diversos',
};

export const categoryOrder: CalculatorCategory[] = [
  'sala', 'quarto', 'cozinha', 'escritorio', 'diversos',
];

function makeItem(
  id: string,
  name: string,
  category: CalculatorCategory,
  w: number,
  h: number,
  d: number,
  stackable = false,
): CalculatorItem {
  return {
    id,
    name,
    category,
    width: w,
    height: h,
    depth: d,
    volume: Math.round(w * h * d * 1000) / 1000,
    stackable,
  };
}

export const calculatorItems: CalculatorItem[] = [
  // Sala
  makeItem('sofa', 'Sofá', 'sala', 2.00, 0.90, 0.90),
  makeItem('poltrona', 'Poltrona', 'sala', 0.80, 0.90, 0.80),
  makeItem('rack', 'Rack', 'sala', 1.80, 0.60, 0.45),
  makeItem('mesa-centro', 'Mesa de centro', 'sala', 1.10, 0.45, 0.60),
  makeItem('televisor', 'Televisor', 'sala', 1.20, 0.75, 0.10),

  // Quarto
  makeItem('cama-solteiro', 'Cama de solteiro', 'quarto', 2.00, 0.45, 0.90),
  makeItem('cama-casal', 'Cama de casal', 'quarto', 2.00, 0.45, 1.40),
  makeItem('guarda-roupa', 'Guarda-roupa', 'quarto', 1.60, 2.10, 0.55),
  makeItem('comoda', 'Cômoda', 'quarto', 1.20, 0.80, 0.45),
  makeItem('criado-mudo', 'Criado-mudo', 'quarto', 0.45, 0.55, 0.40),

  // Cozinha
  makeItem('geladeira', 'Geladeira', 'cozinha', 0.65, 1.70, 0.65),
  makeItem('fogao', 'Fogão', 'cozinha', 0.55, 0.90, 0.60),
  makeItem('micro-ondas', 'Micro-ondas', 'cozinha', 0.50, 0.30, 0.40, true),
  makeItem('mesa-cozinha', 'Mesa', 'cozinha', 1.40, 0.78, 0.80),
  makeItem('cadeira-cozinha', 'Cadeiras', 'cozinha', 0.45, 0.90, 0.45, true),

  // Escritório
  makeItem('mesa-trabalho', 'Mesa de trabalho', 'escritorio', 1.40, 0.75, 0.60),
  makeItem('cadeira-escritorio', 'Cadeira', 'escritorio', 0.55, 1.10, 0.55),
  makeItem('arquivo', 'Arquivo', 'escritorio', 0.47, 1.35, 0.60, true),
  makeItem('caixa-documentos', 'Caixas de documentos', 'escritorio', 0.40, 0.30, 0.35, true),

  // Diversos
  makeItem('bicicleta', 'Bicicleta', 'diversos', 1.70, 1.00, 0.45),
  makeItem('mala', 'Mala', 'diversos', 0.70, 0.50, 0.30, true),
  makeItem('caixa-pequena', 'Caixa pequena', 'diversos', 0.40, 0.30, 0.30, true),
  makeItem('caixa-media', 'Caixa média', 'diversos', 0.50, 0.40, 0.40, true),
  makeItem('caixa-grande', 'Caixa grande', 'diversos', 0.60, 0.50, 0.50, true),
];

export function getItemsByCategory(category: CalculatorCategory): CalculatorItem[] {
  return calculatorItems.filter((item) => item.category === category);
}

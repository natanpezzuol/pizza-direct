export interface Pizza {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  prices: {
    small: number;
    medium: number;
    large: number;
    family: number;
  };
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'Todas', icon: '🍕' },
  { id: 'tradicional', name: 'Tradicionais', icon: '🧀' },
  { id: 'especial', name: 'Especiais', icon: '⭐' },
  { id: 'premium', name: 'Premium', icon: '👑' },
  { id: 'doce', name: 'Doces', icon: '🍫' },
];

export const pizzas: Pizza[] = [
  {
    id: '1',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    image: '',
    category: 'tradicional',
    prices: { small: 32, medium: 42, large: 52, family: 65 },
    popular: true,
  },
  {
    id: '2',
    name: 'Calabresa',
    description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
    image: '',
    category: 'tradicional',
    prices: { small: 35, medium: 45, large: 55, family: 68 },
    popular: true,
  },
  {
    id: '3',
    name: 'Quatro Queijos',
    description: 'Mussarela, provolone, parmesão e gorgonzola',
    image: '',
    category: 'tradicional',
    prices: { small: 38, medium: 48, large: 58, family: 72 },
  },
  {
    id: '4',
    name: 'Portuguesa',
    description: 'Presunto, ovos, cebola, azeitona, ervilha e mussarela',
    image: '',
    category: 'tradicional',
    prices: { small: 36, medium: 46, large: 56, family: 70 },
    popular: true,
  },
  {
    id: '5',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado, catupiry cremoso e mussarela',
    image: '',
    category: 'especial',
    prices: { small: 40, medium: 50, large: 60, family: 75 },
    popular: true,
  },
  {
    id: '6',
    name: 'Pepperoni',
    description: 'Molho de tomate, mussarela e pepperoni importado',
    image: '',
    category: 'especial',
    prices: { small: 42, medium: 52, large: 62, family: 78 },
  },
  {
    id: '7',
    name: 'Napolitana',
    description: 'Tomate fatiado, mussarela de búfala, manjericão e azeite',
    image: '',
    category: 'premium',
    prices: { small: 48, medium: 58, large: 68, family: 85 },
  },
  {
    id: '8',
    name: 'Filé Mignon',
    description: 'Filé mignon em cubos, mussarela, champignon e molho madeira',
    image: '',
    category: 'premium',
    prices: { small: 55, medium: 65, large: 75, family: 95 },
  },
  {
    id: '9',
    name: 'Chocolate',
    description: 'Chocolate ao leite derretido com granulado',
    image: '',
    category: 'doce',
    prices: { small: 35, medium: 45, large: 55, family: 68 },
  },
  {
    id: '10',
    name: 'Romeu e Julieta',
    description: 'Goiabada cremosa e queijo minas derretido',
    image: '',
    category: 'doce',
    prices: { small: 38, medium: 48, large: 58, family: 72 },
  },
];

export const sizes = [
  { id: 'small', name: 'Pequena', slices: '4 fatias', serves: '1-2 pessoas' },
  { id: 'large', name: 'Grande', slices: '8 fatias', serves: '3-4 pessoas' },
];

export const crusts = [
  { id: 'tradicional', name: 'Tradicional', price: 0 },
  { id: 'catupiry', name: 'Catupiry', price: 8 },
  { id: 'cheddar', name: 'Cheddar', price: 8 },
  { id: 'chocolate', name: 'Chocolate', price: 10 },
];

export const extras = [
  { id: 'bacon', name: 'Bacon', price: 6 },
  { id: 'cebola', name: 'Cebola Caramelizada', price: 4 },
  { id: 'rucula', name: 'Rúcula', price: 5 },
  { id: 'tomate-seco', name: 'Tomate Seco', price: 7 },
  { id: 'azeitona', name: 'Azeitonas Extra', price: 4 },
];

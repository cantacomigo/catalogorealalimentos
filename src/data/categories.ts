export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  badge: string;
  description: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'todas',
    name: 'Todas as Categorias',
    iconName: 'LayoutGrid',
    badge: '170+ itens',
    description: 'Navegue por todo o catálogo'
  },
  {
    id: 'laticinios-iogurtes',
    name: 'Iogurtes & Laticínios',
    iconName: 'Milk',
    badge: 'Vigor & Xandô',
    description: 'Iogurtes Gregos, Bebidas Protein, Leites Tipo A, Vitaminas e Sobremesas'
  },
  {
    id: 'queijos-requeijoes',
    name: 'Queijos & Requeijões',
    iconName: 'Boxes',
    badge: 'Faixa Azul & Danubio',
    description: 'Requeijões cremosos, Cream Cheese, Queijo Minas, Brie, Parmesão e Mussarela'
  },
  {
    id: 'embutidos-carnes',
    name: 'Frios, Carnes & Bacalhau',
    iconName: 'Beef',
    badge: 'Rezende, Seara & Riberalves',
    description: 'Presuntos, Calabresas, Carnes Desfiadas Alfama, Bacon e Bacalhau Nobre'
  },
  {
    id: 'paes-hamburgueria',
    name: 'Pães & Hamburgueria',
    iconName: 'UtensilsCrossed',
    badge: 'Zinho & Padrinho',
    description: 'Pães de alho para churrasco, pães brioche, pão australiano e hambúrgueres'
  },
  {
    id: 'massas-pasteis',
    name: 'Massas, Pastéis & Lasanhas',
    iconName: 'Wheat',
    badge: 'Massa Leve',
    description: 'Massas de pastel, Nhoques, Raviólis, Capelettis, Pães de Queijo e Pizzas'
  },
  {
    id: 'vegetais-frutas-polpas',
    name: 'Frutas Congeladas & Polpas',
    iconName: 'Apple',
    badge: 'De Marchi & Top Mais',
    description: 'Polpas de frutas 100g/1kg, Morangos, Frutas Vermelhas IQF, Açaí e Vegetais'
  },
  {
    id: 'batatas-aperitivos',
    name: 'Batatas & Aperitivos',
    iconName: 'Sparkles',
    badge: 'Simplot & Seara',
    description: 'Batatas pré-fritas palito, Bat Crunch, Sidewinders, Fingers e Chicken Bits'
  },
  {
    id: 'molhos-condimentos',
    name: 'Molhos, Ketchup & Conservas',
    iconName: 'Flame',
    badge: 'Cepêra & Knorr',
    description: 'Ketchups, Mostardas, Maioneses especiais, Barbecues, Shoyus e Pimentas'
  },
  {
    id: 'confeitaria-sobremesas',
    name: 'Confeitaria & Doces',
    iconName: 'Cake',
    badge: 'VaBene & Cepêra',
    description: 'Cremes artesanais leitinho/pistache/avelã, Variegatos, Cereais e Geleias'
  },
  {
    id: 'bebidas-chopp',
    name: 'Bebidas, Sucos & Chopp',
    iconName: 'Beer',
    badge: 'Olímpia & Xandô',
    description: 'Chopp artesanal 1L, Sucos integrais de frutas e Gelos saborizados para drinks'
  }
];

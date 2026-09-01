import { Product, FilterState } from '../types';
import { PRODUCTS_PART_1 } from './productsPart1';
import { PRODUCTS_PART_2 } from './productsPart2';
import { PRODUCTS_PART_3 } from './productsPart3';
import { getProductCatalogImage } from './productImages';

const RAW_PRODUCTS: Product[] = [
  ...PRODUCTS_PART_1,
  ...PRODUCTS_PART_2,
  ...PRODUCTS_PART_3
];

export const ALL_PRODUCTS: Product[] = RAW_PRODUCTS.map(p => ({
  ...p,
  originalPrice: p.suggestedPrice,
  imageUrl: p.imageUrl || getProductCatalogImage(p)
}));

export const TOTAL_PAGES_IN_CATALOG = 55;

export function filterAndSortProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  return products.filter((product) => {
    // Search query match across name, brandName, category, tags, description, weight
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brandName.toLowerCase().includes(q) || product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchTags = product.tags.some(tag => tag.toLowerCase().includes(q));
      const matchWeight = product.weight.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchPage = q.startsWith('p') ? product.pageNumber.toString() === q.replace(/\D/g, '') : false;

      if (!matchName && !matchBrand && !matchCategory && !matchTags && !matchWeight && !matchDesc && !matchPage) {
        return false;
      }
    }

    // Brand filter
    if (filters.selectedBrand !== 'todas') {
      if (product.brand !== filters.selectedBrand) {
        return false;
      }
    }

    // Category filter
    if (filters.selectedCategory !== 'todas') {
      if (product.category !== filters.selectedCategory) {
        return false;
      }
    }

    // Temperature filter
    if (filters.selectedTemperature && filters.selectedTemperature !== 'todos') {
      if (product.temperature !== filters.selectedTemperature) {
        return false;
      }
    }

    // Page filter
    if (filters.selectedPage !== null) {
      if (product.pageNumber !== filters.selectedPage) {
        return false;
      }
    }

    // Tag filter
    if (filters.selectedTag) {
      if (!product.tags.includes(filters.selectedTag)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'pt-BR');
      case 'name-desc':
        return b.name.localeCompare(a.name, 'pt-BR');
      case 'brand':
        return a.brandName.localeCompare(b.brandName, 'pt-BR');
      case 'page-asc':
        return a.pageNumber - b.pageNumber;
      case 'price-asc':
        return a.suggestedPrice - b.suggestedPrice;
      case 'price-desc':
        return b.suggestedPrice - a.suggestedPrice;
      case 'relevance':
      default:
        return a.pageNumber - b.pageNumber;
    }
  });
}

export function getProductStats() {
  const brandCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const tempCounts: Record<string, number> = {
    congelado: 0,
    resfriado: 0,
    ambiente: 0
  };

  ALL_PRODUCTS.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    if (tempCounts[p.temperature] !== undefined) {
      tempCounts[p.temperature]++;
    }
  });

  return {
    totalProducts: ALL_PRODUCTS.length,
    brandCounts,
    categoryCounts,
    tempCounts
  };
}

import type { Product, SearchSynonym } from '@/types';
import { DEFAULT_SEARCH_SYNONYMS } from '@/data/searchSynonyms';

/**
 * Enterprise Quick-Commerce Search Engine (Blinkit / Zepto / Flipkart standard)
 * 
 * Features:
 * 1. Punctuation & symbol sanitization (+, -, &, /, etc.)
 * 2. Word-boundary prefix boost (e.g. 'free' -> 'Freedom Refined Sunflower Oil')
 * 3. Exact brand and title match prioritization
 * 4. Singular & plural stemming (e.g. 'pear' <-> 'pears', 'soap' <-> 'soaps')
 * 5. Multi-token strict AND scoring with graceful partial fallback
 * 6. Regional language & Telugu transliteration / Unicode support
 * 7. In-stock availability weighting
 */

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[+,\-_/|*#&()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stemWord(word: string): string {
  if (!word || word.length < 3) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) return word.slice(0, -1);
  return word;
}

export function getWordVariations(word: string): string[] {
  const s = stemWord(word);
  const vars = new Set<string>([word, s]);
  if (!word.endsWith('s')) vars.add(word + 's');
  return Array.from(vars);
}

export interface SearchOptions {
  synonyms?: SearchSynonym[];
  minScore?: number;
  limit?: number;
}

export interface ScoredProduct {
  product: Product;
  score: number;
}

/**
 * Computes relevance score of a single product for a given search query
 */
export function scoreProduct(
  product: Product,
  cleanQuery: string,
  rawTokens: string[],
  stemmedTokens: string[],
  synonymExpansions: Set<string>
): number {
  const name = normalizeSearchText(product.name || '');
  const brand = normalizeSearchText(product.brand || '');
  const category = normalizeSearchText(product.category || '');
  const subCategory = normalizeSearchText(product.subCategory || '');
  const rawName = normalizeSearchText((product as Record<string, unknown>).rawName as string || '');
  const desc = normalizeSearchText(product.description || '');

  const nameWords = name.split(' ').map(stemWord);
  const brandWords = brand.split(' ').map(stemWord);

  let score = 0;
  let matchedTokenCount = 0;

  // 1. Exact Full Query Matches (Top Priority - Blinkit/Flipkart standard)
  if (name === cleanQuery) {
    score += 3000;
  } else if (brand === cleanQuery) {
    score += 2800;
  } else if (name.startsWith(cleanQuery)) {
    // e.g. "free" -> "Freedom Refined Sunflower Oil"
    score += 2200;
  } else if (brand.startsWith(cleanQuery)) {
    // e.g. "free" -> Brand "Freedom"
    score += 2000;
  } else if (brandWords.some((w) => w.startsWith(cleanQuery))) {
    score += 1500;
  } else if (nameWords.some((w) => w.startsWith(cleanQuery))) {
    score += 1300;
  } else if (name.includes(cleanQuery)) {
    score += 900;
  } else if (brand.includes(cleanQuery)) {
    score += 800;
  }

  // 2. Token-by-Token Evaluation
  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const stok = stemmedTokens[i];
    const variations = getWordVariations(tok);
    let tokenMatched = false;

    // Brand matching
    if (brand === tok || brand === stok) {
      score += 700;
      tokenMatched = true;
    } else if (brand.startsWith(tok) || brand.startsWith(stok)) {
      score += 600;
      tokenMatched = true;
    } else if (brandWords.some((w) => w.startsWith(stok) || variations.includes(w))) {
      score += 500;
      tokenMatched = true;
    }

    // Product Title matching
    if (nameWords.some((w) => variations.includes(w) || w === stok || w === tok)) {
      score += 400; // Exact word match in title (e.g. 'Soap' in 'Pears Soft & Fresh Mint Extracts Bathing Bar Soap')
      tokenMatched = true;
    } else if (nameWords.some((w) => w.startsWith(stok) || w.startsWith(tok))) {
      score += 300; // Word prefix in title
      tokenMatched = true;
    } else if (name.includes(tok) || name.includes(stok)) {
      score += 180;
      tokenMatched = true;
    }

    // SubCategory & Category
    if (subCategory.includes(tok) || subCategory.includes(stok)) {
      score += 140;
      tokenMatched = true;
    } else if (category.includes(tok) || category.includes(stok)) {
      score += 100;
      tokenMatched = true;
    }

    // Telugu / Local script and raw transliteration
    if (rawName.includes(tok) || rawName.includes(stok)) {
      score += 160;
      tokenMatched = true;
    } else if (desc.includes(tok)) {
      score += 25; // Subtle description match
      tokenMatched = true;
    }

    if (tokenMatched) matchedTokenCount++;
  }

  // 3. Telugu / Regional Synonym Expansion Boost
  synonymExpansions.forEach((syn) => {
    if (name.includes(syn) || rawName.includes(syn) || subCategory.includes(syn) || category.includes(syn)) {
      score += 260;
      matchedTokenCount = Math.max(matchedTokenCount, 1);
    }
  });

  // 4. Multi-word Strict AND Logic (Solves 'pear soap' / 'pears + soap')
  if (rawTokens.length > 1) {
    if (matchedTokenCount >= rawTokens.length) {
      // Bonus when ALL query tokens match (e.g. both 'pears' AND 'soap')
      score += 1000;
    } else {
      // Heavy demotion for partial matches so competing soaps don't drown out Pears
      score = score * (matchedTokenCount / rawTokens.length) * 0.05;
    }
  }

  // 5. In-Stock Availability Boost
  const isInStock = product.inStock ?? (product as unknown as { in_stock?: boolean }).in_stock ?? true;
  if (isInStock) {
    score += 15;
  }

  return score;
}

/**
 * Filters and ranks products with quick-commerce accuracy.
 * Guarantees accurate results first, with intelligent fallback so all relevant items are reachable.
 */
export function rankAndFilterProducts(
  query: string,
  products: Product[],
  options: SearchOptions = {}
): Product[] {
  const cleanQ = normalizeSearchText(query);
  if (!cleanQ) return [];

  const rawTokens = cleanQ.split(' ').filter(Boolean);
  if (rawTokens.length === 0) return [];

  const stemmedTokens = rawTokens.map(stemWord);
  const synonymsList = options.synonyms || DEFAULT_SEARCH_SYNONYMS;

  // Directional synonym expansion without brand pollution
  const synonymExpansions = new Set<string>();
  synonymsList.forEach((item) => {
    const termClean = normalizeSearchText(item.term);
    const matchesTerm = cleanQ === termClean || rawTokens.includes(termClean) || cleanQ.includes(termClean);
    const matchesSyn = item.synonyms.some((s) => {
      const sc = normalizeSearchText(s);
      return cleanQ === sc || rawTokens.includes(sc);
    });

    if (matchesTerm) {
      item.synonyms.forEach((s) => synonymExpansions.add(normalizeSearchText(s)));
    }
    if (matchesSyn) {
      synonymExpansions.add(termClean);
    }
  });

  const scored: ScoredProduct[] = [];
  const looseMatches: ScoredProduct[] = [];

  for (const p of products) {
    const score = scoreProduct(p, cleanQ, rawTokens, stemmedTokens, synonymExpansions);
    if (score >= 40) {
      scored.push({ product: p, score });
    } else if (score > 5) {
      looseMatches.push({ product: p, score });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // If high-confidence matches are found, return them.
  // If too few or none, append loose matches so the customer is never left stranded.
  const finalResults = scored.length > 0 
    ? scored.map((s) => s.product)
    : looseMatches.sort((a, b) => b.score - a.score).map((s) => s.product);

  if (options.limit && options.limit > 0) {
    return finalResults.slice(0, options.limit);
  }

  return finalResults;
}

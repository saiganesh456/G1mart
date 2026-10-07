import { SearchSynonym } from '@/types';

/**
 * Search Synonyms Table
 *
 * Store-editable lookup table for regional language (Telugu transliterated)
 * and colloquial customer search queries.
 *
 * IMPORTANT:
 * - Do NOT invent loose synonyms.
 * - Table contains only explicit verified regional & staple matches.
 * - Store owner can add new synonyms dynamically.
 */
export const DEFAULT_SEARCH_SYNONYMS: SearchSynonym[] = [
  {
    id: 'syn-1',
    term: 'kandipappu',
    synonyms: ['toor dal', 'red gram', 'arhar dal', 'dal'],
  },
  {
    id: 'syn-2',
    term: 'minapappu',
    synonyms: ['urad dal', 'black gram', 'dal'],
  },
  {
    id: 'syn-3',
    term: 'pesara pappu',
    synonyms: ['moong dal', 'green gram', 'dal'],
  },
  {
    id: 'syn-4',
    term: 'senaga pappu',
    synonyms: ['chana dal', 'bengal gram', 'dal'],
  },
  {
    id: 'syn-5',
    term: 'nune',
    synonyms: ['oil', 'sunflower oil', 'freedom', 'gold winner', 'gemini'],
  },
  {
    id: 'syn-6',
    term: 'panchadara',
    synonyms: ['sugar', 'cheeni', 'white sugar', 'madhur'],
  },
  {
    id: 'syn-7',
    term: 'bellam',
    synonyms: ['jaggery', 'organic jaggery'],
  },
  {
    id: 'syn-8',
    term: 'uppu',
    synonyms: ['salt', 'tata salt', 'rock salt'],
  },
  {
    id: 'syn-9',
    term: 'sabbu',
    synonyms: ['soap', 'mysore sandal', 'cinthol', 'bath soap'],
  },
  {
    id: 'syn-10',
    term: 'surf',
    synonyms: ['surf excel', 'detergent', 'washing powder', 'ariel', 'tide', 'rin'],
  },
  {
    id: 'syn-11',
    term: 'pasupu',
    synonyms: ['turmeric', 'haldi'],
  },
  {
    id: 'syn-12',
    term: 'miriyalu',
    synonyms: ['pepper', 'black pepper'],
  },
  {
    id: 'syn-13',
    term: 'jeelakarra',
    synonyms: ['cumin', 'jeera'],
  },
  {
    id: 'syn-14',
    term: 'aavalu',
    synonyms: ['mustard', 'rai'],
  },
  {
    id: 'syn-15',
    term: 'semiya',
    synonyms: ['vermicelli', 'swastiks', 'bambino'],
  },
  {
    id: 'syn-16',
    term: 'rava',
    synonyms: ['suji', 'sooji', 'bombay rava'],
  },
];

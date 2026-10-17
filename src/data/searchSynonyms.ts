import { SearchSynonym } from '@/types';

/**
 * Search Synonyms Table
 *
 * Store-editable lookup table for regional language (Telugu transliterated & Unicode)
 * and colloquial customer search queries.
 *
 * IMPORTANT:
 * - Maps colloquial & regional language staples to standard categories and items.
 * - Does NOT include competing brand names inside generic categories (which would pollute brand search).
 */
export const DEFAULT_SEARCH_SYNONYMS: SearchSynonym[] = [
  {
    id: 'syn-1',
    term: 'kandipappu',
    synonyms: ['కందిపప్పు', 'toor dal', 'red gram', 'arhar dal', 'dal', 'toor'],
  },
  {
    id: 'syn-2',
    term: 'minapappu',
    synonyms: ['మినపప్పు', 'urad dal', 'black gram', 'dal', 'urad'],
  },
  {
    id: 'syn-3',
    term: 'pesara pappu',
    synonyms: ['పెసరపప్పు', 'moong dal', 'green gram', 'dal', 'moong'],
  },
  {
    id: 'syn-4',
    term: 'senaga pappu',
    synonyms: ['శనగపప్పు', 'chana dal', 'bengal gram', 'dal', 'chana'],
  },
  {
    id: 'syn-5',
    term: 'nune',
    synonyms: ['నూనె', 'oil', 'cooking oil', 'sunflower oil', 'edible oil'],
  },
  {
    id: 'syn-6',
    term: 'panchadara',
    synonyms: ['పంచదార', 'sugar', 'cheeni', 'white sugar'],
  },
  {
    id: 'syn-7',
    term: 'bellam',
    synonyms: ['బెల్లం', 'jaggery', 'organic jaggery', 'mishri', 'patika bellam'],
  },
  {
    id: 'syn-8',
    term: 'uppu',
    synonyms: ['ఉప్పు', 'salt', 'rock salt', 'crystal salt', 'table salt'],
  },
  {
    id: 'syn-9',
    term: 'sabbu',
    synonyms: ['సబ్బు', 'soap', 'bath soap', 'bathing bar', 'body wash'],
  },
  {
    id: 'syn-10',
    term: 'surf',
    synonyms: ['సర్ఫ్', 'detergent', 'washing powder', 'laundry powder', 'detergent powder'],
  },
  {
    id: 'syn-11',
    term: 'pasupu',
    synonyms: ['పసుపు', 'turmeric', 'haldi', 'turmeric powder'],
  },
  {
    id: 'syn-12',
    term: 'miriyalu',
    synonyms: ['మిరియాలు', 'pepper', 'black pepper', 'kali mirch'],
  },
  {
    id: 'syn-13',
    term: 'jeelakarra',
    synonyms: ['జీలకర్ర', 'cumin', 'jeera', 'cumin seeds'],
  },
  {
    id: 'syn-14',
    term: 'aavalu',
    synonyms: ['ఆవాలు', 'mustard', 'rai', 'mustard seeds'],
  },
  {
    id: 'syn-15',
    term: 'semiya',
    synonyms: ['సేమియా', 'vermicelli', 'seviyan'],
  },
  {
    id: 'syn-16',
    term: 'rava',
    synonyms: ['రవ్వ', 'suji', 'sooji', 'bombay rava', 'upma rava'],
  },
  {
    id: 'syn-17',
    term: 'pappu',
    synonyms: ['పప్పు', 'dal', 'dhal', 'pulses', 'lentils'],
  },
  {
    id: 'syn-18',
    term: 'biyyam',
    synonyms: ['బియ్యం', 'rice', 'sona masoori', 'raw rice', 'boiled rice', 'basmati'],
  },
  {
    id: 'syn-19',
    term: 'neyyi',
    synonyms: ['నెయ్యి', 'ghee', 'clarified butter', 'cow ghee'],
  },
  {
    id: 'syn-20',
    term: 'perugu',
    synonyms: ['పెరుగు', 'curd', 'dahi', 'yogurt'],
  },
  {
    id: 'syn-21',
    term: 'paalu',
    synonyms: ['పాలు', 'milk', 'fresh milk', 'toned milk', 'dairy'],
  },
  {
    id: 'syn-22',
    term: 'chaaya',
    synonyms: ['టీ', 'tea', 'chai', 'tea powder'],
  },
  {
    id: 'syn-23',
    term: 'kaafi',
    synonyms: ['కాఫీ', 'coffee', 'coffee powder', 'instant coffee'],
  },
  {
    id: 'syn-24',
    term: 'maggi',
    synonyms: ['maggie', 'noodles', 'instant noodles'],
  },
  {
    id: 'syn-25',
    term: 'sajjalu',
    synonyms: ['సజ్జలు', 'pearl millet', 'millet', 'bajra'],
  },
  {
    id: 'syn-26',
    term: 'jonnalu',
    synonyms: ['జొన్నలు', 'jowar', 'sorghum'],
  },
  {
    id: 'syn-27',
    term: 'attalu',
    synonyms: ['ఆటా', 'atta', 'wheat flour', 'chakki atta', 'flour'],
  },
];

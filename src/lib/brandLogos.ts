import migratedBrandsData from '../../data/migrated_brands.json';

const brandLogoMap = new Map<string, string>();

for (const b of migratedBrandsData) {
  if (b.logo_url) {
    brandLogoMap.set(b.name.toLowerCase().trim(), b.logo_url);
    // Also add slug-based key
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    brandLogoMap.set(slug, b.logo_url);
  }
}

// Common aliases
const ALIASES: Record<string, string> = {
  'aashirvaad': '/brands/aashirvaad.png',
  'itc aashirvaad': '/brands/aashirvaad.png',
  'britannia': '/brands/britannia.png',
  'cadbury': '/brands/cadbury.png',
  'mondelez cadbury': '/brands/cadbury.png',
  'unibic': '/brands/unibic.png',
  'sunfeast': '/brands/sunfeast.png',
  'itc sunfeast': '/brands/sunfeast.png',
  'colgate': '/brands/colgate.png',
  'mysore sandal': '/brands/mysore-sandal.png',
  'santoor': '/brands/santoor.png',
  'wipro santoor': '/brands/santoor.png',
  'dettol': '/brands/dettol.png',
  'reckitt dettol': '/brands/dettol.png',
  'dove': '/brands/dove.png',
  'pears': '/brands/pears.png',
  'surf excel': '/brands/surf-excel.png',
  'hul surf excel': '/brands/surf-excel.png',
  'vim': '/brands/vim.png',
  'hul vim': '/brands/vim.png',
  'exo': '/brands/exo.png',
  'horlicks': '/brands/horlicks.png',
  'bru': '/brands/bru.png',
  '3 roses': '/brands/3-roses.png',
  'brooke bond 3 roses': '/brands/3-roses.png',
  'parle': '/brands/parle.png',
  'freedom': '/brands/freedom.png',
  'aachi': '/brands/aachi.png',
  'kissan': '/brands/kissan.png',
  'knorr': '/brands/knorr.png',
  'arun icecreams': '/brands/arun-icecreams.png',
  'nestle': '/brands/nestle.png',
  'dabur': '/brands/dabur.png',
  'ponds': '/brands/ponds.png',
  'huggies': '/brands/huggies.png',
  'ujala': '/brands/ujala.png',
  'rin': '/brands/rin.png',
  'comfort': '/brands/comfort.png',
  'parachute': '/brands/parachute.png',
  'clinic plus': '/brands/clinic-plus.png',
  'meera': '/brands/meera.png',
  'bingo': '/brands/bingo.png',
  'itc bingo': '/brands/bingo.png',
  'lifebuoy': '/brands/lifebuoy.png',
  'himalaya': '/brands/himalaya.png',
  'cinthol': '/brands/cinthol.png',
  'harpic': '/brands/harpic.png',
  'lizol': '/brands/lizol.png',
  'whisper': '/brands/whisper.png',
  'stayfree': '/brands/stayfree.png',
  'ariel': '/brands/ariel.png',
  'tide': '/brands/tide.png',
  'thums up': '/brands/thums-up.png',
  'coca-cola': '/brands/coca-cola.png',
  'sprite': '/brands/sprite.png',
  'maaza': '/brands/maaza.png',
  'limca': '/brands/limca.png',
  'bambino': '/brands/bambino.png',
  'mtr': '/brands/mtr.png',
  'tata': '/brands/tata.png',
  'tata salt': '/brands/tata-salt.png',
  'wagh bakri': '/brands/wagh-bakri.png',
  'taj mahal': '/brands/taj-mahal.png',
  'red label': '/brands/red-label.png',
  'sensodyne': '/brands/sensodyne.png',
  'close up': '/brands/close-up.png',
  'eno': '/brands/eno.png',
  'wheel': '/brands/wheel.png',
  'domex': '/brands/domex.png',
  'odonil': '/brands/odonil.png',
  'priya': '/brands/priya.png',
  'boost': '/brands/boost.png',
  'lipton': '/brands/lipton.png',
  'vaseline': '/brands/vaseline.png',
  'garnier': '/brands/garnier.png',
  'lotte': '/brands/lotte.png',
  'fiama': '/brands/fiama.png',
  'sunsilk': '/brands/sunsilk.png',
  'medimix': '/brands/medimix.png',
  'godrej': '/brands/godrej.png',
  'hatsun': '/brands/hatsun.png',
  'pepsodent': '/brands/pepsodent.png',
  'yardley': '/brands/yardley.png',
  'amul': '/brands/amul.png',
  'sri durga': '/brands/sri-durga.png',
  'zed black': '/brands/zed-black.png',
  'mangaldeep': '/brands/mangaldeep.png',
};

for (const [k, v] of Object.entries(ALIASES)) {
  brandLogoMap.set(k.toLowerCase().trim(), v);
}

export function getBrandLogo(brandName: string): string | null {
  if (!brandName) return null;
  const key = brandName.toLowerCase().trim();
  if (brandLogoMap.has(key)) return brandLogoMap.get(key)!;
  
  // Fuzzy partial match
  for (const [k, v] of brandLogoMap.entries()) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return null;
}

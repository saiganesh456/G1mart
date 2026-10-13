/**
 * Comprehensive Nellore Localities, Colonies, Landmarks & Mandals Database
 * Used for instant, zero-latency address search autocomplete as users type even a single letter/word.
 */

export interface NelloreAreaItem {
  id: string;
  name: string;
  aliases: string[];
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  landmark?: string;
  zoneId?: string;
}

export const NELLORE_LOCALITIES: NelloreAreaItem[] = [
  // 0 - 5 km Local Zone
  {
    id: 'padarupalli-hub',
    name: 'Padarupalli (Near G1 Mart Hub)',
    aliases: [
      'padarupalli',
      'padara palli',
      'padarapalli',
      'padarupally',
      'padaripalli',
      'govt hospital padarupalli',
      'govt hospital',
    ],
    area: 'Padarupalli',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4329,
    lng: 79.9680,
    landmark: 'Beside Govt Hospital, Padarupalli',
    zoneId: 'zone-0-5',
  },
  {
    id: 'balaji-nagar',
    name: 'Balaji Nagar',
    aliases: [
      'balaji',
      'balaji nagar',
      'balaji nellore',
      'balajinagar',
      'balaji nagar nellore',
      'balaji nagar main road',
      'ramji nagar',
    ],
    area: 'Balaji Nagar',
    city: 'Nellore',
    pincode: '524002',
    lat: 14.4485,
    lng: 79.9792,
    landmark: 'Balaji Nagar 1st Lane to 4th Lane',
    zoneId: 'zone-0-5',
  },
  {
    id: 'magunta-layout',
    name: 'Magunta Layout',
    aliases: [
      'magunta',
      'magunta layout',
      'magunta nellore',
      'magunta statue',
      'magunta nagar',
      'magunta layout nellore',
    ],
    area: 'Magunta Layout',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4332,
    lng: 79.9747,
    landmark: 'Magunta Layout Main Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'pogathota',
    name: 'Pogathota',
    aliases: [
      'pogathota',
      'poga thota',
      'pogathota nellore',
      'pogathota main road',
      'gandhi statue',
    ],
    area: 'Pogathota',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4428,
    lng: 79.9865,
    landmark: 'Near Gandhi Statue / Trunk Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'vrc-centre',
    name: 'VRC Centre / Trunk Road',
    aliases: [
      'vrc',
      'vrc centre',
      'vrc center',
      'vrc nellore',
      'trunk road',
      'trunk road nellore',
      'vrc circle',
      'vr college',
    ],
    area: 'VRC Centre',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4447,
    lng: 79.9882,
    landmark: 'VR College Grounds / Trunk Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'haranathapuram',
    name: 'Haranathapuram',
    aliases: ['haranathapuram', 'haranadhapuram', 'harinathapuram', 'haranathapuram nellore'],
    area: 'Haranathapuram',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4361,
    lng: 79.9715,
    landmark: 'Haranathapuram Main Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'dargamitta',
    name: 'Dargamitta',
    aliases: ['dargamitta', 'darga mitta', 'collector office', 'dargamitta nellore'],
    area: 'Dargamitta',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4395,
    lng: 79.9702,
    landmark: 'Near Collectorate / ZP Office',
    zoneId: 'zone-0-5',
  },
  {
    id: 'vedayapalem',
    name: 'Vedayapalem',
    aliases: ['vedayapalem', 'vedayapalem bypass', 'vedayapalam', 'vedayapalem nellore'],
    area: 'Vedayapalem',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4285,
    lng: 79.9760,
    landmark: 'Vedayapalem Railway Station Area',
    zoneId: 'zone-0-5',
  },
  {
    id: 'bv-nagar',
    name: 'BV Nagar (Babu Jagjivan Ram Nagar)',
    aliases: ['bv nagar', 'b.v. nagar', 'bhavani nagar', 'bvnagar', 'bv nagar nellore'],
    area: 'BV Nagar',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4215,
    lng: 79.9675,
    landmark: 'BV Nagar Main Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'stonehousepet',
    name: 'Stonehousepet',
    aliases: ['stonehousepet', 'stonehouse pet', 'stone house pet', 'stonehousepet nellore'],
    area: 'Stonehousepet',
    city: 'Nellore',
    pincode: '524002',
    lat: 14.4552,
    lng: 79.9876,
    landmark: 'Near Ranganayaka Temple',
    zoneId: 'zone-0-5',
  },
  {
    id: 'santhapet',
    name: 'Santhapet',
    aliases: ['santhapet', 'shanthapet', 'santha pet', 'santhapet nellore'],
    area: 'Santhapet',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4491,
    lng: 79.9912,
    landmark: 'Santhapet Market',
    zoneId: 'zone-0-5',
  },
  {
    id: 'childrens-park',
    name: 'Childrens Park Road',
    aliases: ['childrens park', 'children park', 'children park road', 'childrens park nellore'],
    area: 'Childrens Park Road',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4410,
    lng: 79.9780,
    landmark: 'Childrens Park Walking Track',
    zoneId: 'zone-0-5',
  },
  {
    id: 'ramalingapuram',
    name: 'Ramalingapuram',
    aliases: ['ramalingapuram', 'ramalinga puram', 'ramalingapuram nellore'],
    area: 'Ramalingapuram',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4350,
    lng: 79.9805,
    landmark: 'Ramalingapuram Main Center',
    zoneId: 'zone-0-5',
  },
  {
    id: 'podalakur-road',
    name: 'Podalakur Road',
    aliases: ['podalakur road', 'podalakuru road', 'podalakur road nellore'],
    area: 'Podalakur Road',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4270,
    lng: 79.9620,
    landmark: 'City Limits, Podalakur Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'fathekhanpet',
    name: 'Fathekhanpet',
    aliases: ['fathekhanpet', 'fateh khan pet', 'fathekhanpet nellore'],
    area: 'Fathekhanpet',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4465,
    lng: 79.9930,
    landmark: 'Fathekhanpet Canal Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'nawabpet',
    name: 'Nawabpet',
    aliases: ['nawabpet', 'nawab pet', 'nawabpet nellore'],
    area: 'Nawabpet',
    city: 'Nellore',
    pincode: '524002',
    lat: 14.4580,
    lng: 79.9850,
    landmark: 'Nawabpet Main Street',
    zoneId: 'zone-0-5',
  },
  {
    id: 'mini-bypass',
    name: 'Mini Bypass Road',
    aliases: ['mini bypass', 'mini bypass road', 'current office', 'mini bypass nellore'],
    area: 'Mini Bypass Road',
    city: 'Nellore',
    pincode: '524003',
    lat: 14.4380,
    lng: 79.9720,
    landmark: 'Near Current Office Arch',
    zoneId: 'zone-0-5',
  },
  {
    id: 'kallurpalli',
    name: 'Kallurpalli',
    aliases: ['kallurpalli', 'kalluru palli', 'kallurpally', 'kallurpalli nellore'],
    area: 'Kallurpalli',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4180,
    lng: 79.9540,
    landmark: 'Near National Highway Junction',
    zoneId: 'zone-0-5',
  },
  {
    id: 'chinthareddypalem',
    name: 'Chinthareddypalem (Narayana Hospital)',
    aliases: [
      'chinthareddypalem',
      'chintha reddy palem',
      'narayana hospital',
      'narayana medical college',
      'chinthareddypalem nellore',
    ],
    area: 'Chinthareddypalem',
    city: 'Nellore',
    pincode: '524002',
    lat: 14.4120,
    lng: 79.9820,
    landmark: 'Beside Narayana Medical College & Hospital',
    zoneId: 'zone-0-5',
  },
  {
    id: 'nellore-railway-station',
    name: 'Nellore Railway Station',
    aliases: ['railway station', 'nellore station', 'station road', 'railway station nellore'],
    area: 'Station Road',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4460,
    lng: 79.9830,
    landmark: 'Railway Station Complex',
    zoneId: 'zone-0-5',
  },
  {
    id: 'rtc-bus-stand',
    name: 'RTC Bus Stand (Nellore Central)',
    aliases: ['bus stand', 'rtc bus stand', 'atmaram bus stand', 'central bus stand nellore'],
    area: 'Central Bus Stand Area',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4440,
    lng: 79.9870,
    landmark: 'Nellore APSRTC Complex',
    zoneId: 'zone-0-5',
  },

  // 5 - 10 km City Zone
  {
    id: 'kovur',
    name: 'Kovur',
    aliases: ['kovur', 'kovuru', 'kovur toll plaza', 'kovur nellore'],
    area: 'Kovur',
    city: 'Nellore',
    pincode: '524137',
    lat: 14.4950,
    lng: 79.9860,
    landmark: 'Pennar River Bridge / Kovur Main Road',
    zoneId: 'zone-5-10',
  },
  {
    id: 'damaramadugu',
    name: 'Damaramadugu',
    aliases: ['damaramadugu', 'dhamaramadugu', 'damaramadugu nellore'],
    area: 'Damaramadugu',
    city: 'Nellore',
    pincode: '524137',
    lat: 14.4820,
    lng: 80.0350,
    landmark: 'Damaramadugu Centre',
    zoneId: 'zone-5-10',
  },

  // 10 - 15 km Suburban Zone
  {
    id: 'venkatachalam',
    name: 'Venkatachalam',
    aliases: [
      'venkatachalam',
      'venkata chalam',
      'swarna bharathi institute',
      'venkatachalam nellore',
    ],
    area: 'Venkatachalam',
    city: 'Nellore',
    pincode: '524320',
    lat: 14.3180,
    lng: 79.9230,
    landmark: 'Venkatachalam Toll / Railway Station',
    zoneId: 'zone-10-15',
  },
  {
    id: 'indukurpet',
    name: 'Indukurpet',
    aliases: ['indukurpet', 'indukurupeta', 'indukurupet', 'indukurpet nellore'],
    area: 'Indukurpet',
    city: 'Nellore',
    pincode: '524314',
    lat: 14.4680,
    lng: 80.1420,
    landmark: 'Indukurpet Bus Stand Area',
    zoneId: 'zone-10-15',
  },
  {
    id: 'kakupalli',
    name: 'Kakupalli',
    aliases: ['kakupalli', 'kaku palli', 'kakupalli nellore'],
    area: 'Kakupalli',
    city: 'Nellore',
    pincode: '524320',
    lat: 14.3410,
    lng: 79.9520,
    landmark: 'Kakupalli Crossroad',
    zoneId: 'zone-10-15',
  },
  {
    id: 'kodavalur',
    name: 'Kodavalur',
    aliases: ['kodavalur', 'kodavaluru', 'kodavalur nellore'],
    area: 'Kodavalur',
    city: 'Nellore',
    pincode: '524316',
    lat: 14.5320,
    lng: 79.9760,
    landmark: 'NH16 Kodavalur Junction',
    zoneId: 'zone-10-15',
  },

  // 15 - 30 km Extended Zone
  {
    id: 'buchireddypalem',
    name: 'Buchireddypalem',
    aliases: ['buchireddypalem', 'buchi', 'buchireddy palem', 'buchireddypalem nellore'],
    area: 'Buchireddypalem',
    city: 'Nellore',
    pincode: '524305',
    lat: 14.5360,
    lng: 79.8770,
    landmark: 'Kanigiri Road / Buchi Center',
    zoneId: 'zone-15-30',
  },
  {
    id: 'muthukur',
    name: 'Muthukur',
    aliases: ['muthukur', 'muthukuru', 'krishnapatnam port road', 'muthukur nellore'],
    area: 'Muthukur',
    city: 'Nellore',
    pincode: '524344',
    lat: 14.2760,
    lng: 80.1120,
    landmark: 'Muthukur Mandal Headquarters',
    zoneId: 'zone-15-30',
  },
  {
    id: 'podalakur-town',
    name: 'Podalakur (Mandal)',
    aliases: ['podalakur', 'podalakuru', 'podalukur', 'podalakur nellore'],
    area: 'Podalakur',
    city: 'Nellore',
    pincode: '524345',
    lat: 14.3720,
    lng: 79.7280,
    landmark: 'Podalakur Bus Stand',
    zoneId: 'zone-15-30',
  },
  {
    id: 'allur',
    name: 'Allur',
    aliases: ['allur', 'alluru', 'allur nellore'],
    area: 'Allur',
    city: 'Nellore',
    pincode: '524315',
    lat: 14.6890,
    lng: 80.0530,
    landmark: 'Allur Market Center',
    zoneId: 'zone-15-30',
  },
];

/**
 * Intelligent token-based search for Nellore locations.
 * Matches multi-word queries like "Balaji Nellore", "Padara Palli", "Magunta Layout", etc.
 */
export function searchNelloreLocations(query: string, limit = 8): NelloreAreaItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter(Boolean);

  // Exact or prefix matches on entire phrase
  const topMatches: NelloreAreaItem[] = [];
  const tokenMatches: NelloreAreaItem[] = [];
  const partialMatches: NelloreAreaItem[] = [];

  for (const item of NELLORE_LOCALITIES) {
    const nameLower = item.name.toLowerCase();
    const areaLower = item.area.toLowerCase();
    const landmarkLower = (item.landmark || '').toLowerCase();
    const aliasStr = item.aliases.join(' ').toLowerCase();
    const fullText = `${nameLower} ${areaLower} ${landmarkLower} ${aliasStr} nellore`;

    // 1. Direct exact/prefix match
    if (nameLower.startsWith(clean) || areaLower.startsWith(clean) || item.aliases.some((a) => a.startsWith(clean))) {
      topMatches.push(item);
      continue;
    }

    // 2. All tokens match (e.g. "Balaji" + "Nellore")
    const allTokensMatch = tokens.every((tok) => fullText.includes(tok));
    if (allTokensMatch) {
      tokenMatches.push(item);
      continue;
    }

    // 3. Any token matches (excluding generic 'nellore' if query has other tokens)
    const substantiveTokens = tokens.filter((t) => t !== 'nellore');
    const searchTokens = substantiveTokens.length > 0 ? substantiveTokens : tokens;
    const someTokenMatches = searchTokens.some((tok) => fullText.includes(tok));
    if (someTokenMatches) {
      partialMatches.push(item);
    }
  }

  const combined = [...topMatches, ...tokenMatches, ...partialMatches];
  // Deduplicate by ID
  const seen = new Set<string>();
  const unique: NelloreAreaItem[] = [];
  for (const item of combined) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }

  return unique.slice(0, limit);
}

/**
 * Find the closest Nellore locality from given GPS coordinates
 */
export function findNearestNelloreLocality(lat: number, lng: number): { locality: NelloreAreaItem; distanceKm: number } | null {
  if (!lat || !lng) return null;

  let closest: NelloreAreaItem | null = null;
  let minDistance = Infinity;

  for (const item of NELLORE_LOCALITIES) {
    const R = 6371;
    const dLat = (lat - item.lat) * (Math.PI / 180);
    const dLon = (lng - item.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(item.lat * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  if (closest && minDistance <= 35) {
    return { locality: closest, distanceKm: Math.round(minDistance * 10) / 10 };
  }

  return null;
}

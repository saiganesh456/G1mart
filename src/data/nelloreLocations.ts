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
    aliases: ['padarupalli', 'padurupalli', 'govt hospital padarupalli', 'padarupally'],
    area: 'Padarupalli',
    city: 'Nellore',
    pincode: '524004',
    lat: 14.4329,
    lng: 79.9680,
    landmark: 'Beside Govt Hospital, Padarupalli',
    zoneId: 'zone-0-5',
  },
  {
    id: 'magunta-layout',
    name: 'Magunta Layout',
    aliases: ['magunta', 'magunta layout', 'magunta statue', 'magunta nagar'],
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
    aliases: ['pogathota', 'poga thota', 'pogathota main road'],
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
    aliases: ['vrc', 'vrc centre', 'vrc center', 'trunk road', 'vrc circle'],
    area: 'VRC Centre',
    city: 'Nellore',
    pincode: '524001',
    lat: 14.4447,
    lng: 79.9882,
    landmark: 'VR College Grounds / Trunk Road',
    zoneId: 'zone-0-5',
  },
  {
    id: 'balaji-nagar',
    name: 'Balaji Nagar',
    aliases: ['balaji', 'balaji nagar', 'balajinagar', 'balaji nagar main road'],
    area: 'Balaji Nagar',
    city: 'Nellore',
    pincode: '524002',
    lat: 14.4485,
    lng: 79.9792,
    landmark: 'Balaji Nagar 1st Lane to 4th Lane',
    zoneId: 'zone-0-5',
  },
  {
    id: 'haranathapuram',
    name: 'Haranathapuram',
    aliases: ['haranathapuram', 'haranadhapuram', 'harinathapuram'],
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
    aliases: ['dargamitta', 'darga mitta', 'collector office'],
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
    aliases: ['vedayapalem', 'vedayapalem bypass', 'vedayapalam'],
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
    aliases: ['bv nagar', 'b.v. nagar', 'bhavani nagar', 'bvnagar'],
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
    aliases: ['stonehousepet', 'stonehouse pet', 'stone house pet'],
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
    aliases: ['santhapet', 'shanthapet', 'santha pet'],
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
    aliases: ['childrens park', 'children park', 'children park road'],
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
    aliases: ['ramalingapuram', 'ramalinga puram'],
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
    aliases: ['podalakur road', 'podalakuru road'],
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
    aliases: ['fathekhanpet', 'fateh khan pet'],
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
    aliases: ['nawabpet', 'nawab pet'],
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
    aliases: ['mini bypass', 'mini bypass road', 'current office'],
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
    aliases: ['kallurpalli', 'kalluru palli', 'kallurpally'],
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
    name: 'Chinthareddypalem',
    aliases: ['chinthareddypalem', 'chintha reddy palem', 'narayana hospital'],
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
    aliases: ['railway station', 'nellore station', 'station road'],
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
    aliases: ['bus stand', 'rtc bus stand', 'atmaram bus stand'],
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
    aliases: ['kovur', 'kovuru', 'kovur toll plaza'],
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
    aliases: ['damaramadugu', 'dhamaramadugu'],
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
    aliases: ['venkatachalam', 'venkata chalam', 'swarna bharathi institute'],
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
    aliases: ['indukurpet', 'indukurupeta', 'indukurupet'],
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
    aliases: ['kakupalli', 'kaku palli'],
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
    aliases: ['kodavalur', 'kodavaluru'],
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
    aliases: ['buchireddypalem', 'buchi', 'buchireddy palem'],
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
    aliases: ['muthukur', 'muthukuru', 'krishnapatnam port road'],
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
    aliases: ['podalakur', 'podalakuru', 'podalukur'],
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
    aliases: ['allur', 'alluru'],
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
 * Instant in-memory search for Nellore locations.
 * Works even with 1 single character or word.
 */
export function searchNelloreLocations(query: string, limit = 8): NelloreAreaItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // 1. Exact or prefix matches on name / aliases
  const prefixMatches: NelloreAreaItem[] = [];
  const substringMatches: NelloreAreaItem[] = [];

  for (const item of NELLORE_LOCALITIES) {
    const nameLower = item.name.toLowerCase();
    const areaLower = item.area.toLowerCase();
    const landmarkLower = (item.landmark || '').toLowerCase();

    const isPrefix =
      nameLower.startsWith(clean) ||
      areaLower.startsWith(clean) ||
      item.aliases.some((a) => a.startsWith(clean));

    if (isPrefix) {
      prefixMatches.push(item);
    } else {
      const isSubstring =
        nameLower.includes(clean) ||
        areaLower.includes(clean) ||
        landmarkLower.includes(clean) ||
        item.aliases.some((a) => a.includes(clean)) ||
        item.pincode.startsWith(clean);

      if (isSubstring) {
        substringMatches.push(item);
      }
    }
  }

  return [...prefixMatches, ...substringMatches].slice(0, limit);
}

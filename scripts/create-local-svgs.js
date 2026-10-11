const fs = require('fs');

const svgs = {
  'local-dals': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#F7F6EE"/>
  <circle cx="100" cy="100" r="55" fill="#FEF08A" opacity="0.7" filter="url(#shadow)"/>
  <g transform="translate(60, 60) scale(1.6)" fill="none" stroke="#CA8A04" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M25 10 C15 25, 10 35, 25 45 C40 35, 35 25, 25 10 Z" fill="#EAB308"/>
    <path d="M38 18 C30 28, 26 36, 38 44 C50 36, 46 28, 38 18 Z" fill="#FACC15" opacity="0.8"/>
  </g>
</svg>`,
  'local-flours': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#F7F6EE"/>
  <circle cx="100" cy="100" r="55" fill="#FDE68A" opacity="0.7" filter="url(#shadow)"/>
  <g transform="translate(60, 58) scale(1.6)" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 40 C15 20, 35 20, 38 40 Z" fill="#FDE68A"/>
    <ellipse cx="25" cy="40" rx="14" ry="4" fill="#D97706"/>
    <circle cx="25" cy="18" r="4" fill="#B45309"/>
  </g>
</svg>`,
  'local-dry-fruits': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#F7F6EE"/>
  <circle cx="100" cy="100" r="55" fill="#FED7AA" opacity="0.7" filter="url(#shadow)"/>
  <g transform="translate(62, 60) scale(1.6)" fill="none" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 15 C30 10, 42 22, 35 38 C28 46, 12 42, 15 15 Z" fill="#FB923C"/>
    <circle cx="35" cy="22" r="5" fill="#EA580C"/>
  </g>
</svg>`,
  'local-millets': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#F7F6EE"/>
  <circle cx="100" cy="100" r="55" fill="#E9D5FF" opacity="0.7" filter="url(#shadow)"/>
  <g transform="translate(68, 56) scale(1.6)" fill="none" stroke="#7E22CE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 48 L20 8 M14 20 L26 24 M26 30 L14 34 M14 40 L26 44"/>
  </g>
</svg>`
};

for (const [key, content] of Object.entries(svgs)) {
  fs.writeFileSync(`public/categories/collages/${key}.svg`, content, 'utf8');
}
console.log('SVGs created successfully');

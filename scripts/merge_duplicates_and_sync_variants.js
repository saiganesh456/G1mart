const fs = require('fs');

const prodsPath = './data/migrated_products.json';
const varsPath = './data/migrated_product_variants.json';

const prods = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));
const variants = JSON.parse(fs.readFileSync(varsPath, 'utf8'));

console.log(`Starting merge & variant sync. Initial products: ${prods.length}, variants: ${variants.length}`);

// 1. Fix Branded items that had wrong G1 generated pouches
const brandedFixes = {
  'g1-p1001': '/products/packshots/aashirvaad-chilli-powder.webp',
  'g1-mdh-deggi-mirch': '/products/packshots/mdh-deggi-mirch.webp',
  'g1-p1022': '/products/packshots/sri-durga-coriander.webp',
  'g1-lion-dates': '/products/packshots/lion-dates-500g.webp',
};

Object.entries(brandedFixes).forEach(([id, img]) => {
  const p = prods.find(x => x.id === id);
  if (p) {
    p.image_url = img;
    p.imageUrl = img;
    console.log(`Fixed branded packshot for ${id} (${p.name}) -> ${img}`);
  }
});

// Helper to deactivate products
function deactivate(ids) {
  ids.forEach(id => {
    const p = prods.find(x => x.id === id);
    if (p) {
      p.is_active = false;
      p.isActive = false;
      console.log(`Deactivated duplicate: ${id} (${p.name})`);
    }
  });
}

// Helper to ensure product has specific variants
function ensureVariants(productId, varDefs) {
  // Remove existing variants for this product to prevent duplicate keys
  const remaining = variants.filter(v => v.product_id !== productId);
  variants.length = 0;
  variants.push(...remaining);

  varDefs.forEach((def, idx) => {
    variants.push({
      id: `${productId}-v${idx + 1}`,
      product_id: productId,
      size_label: def.size,
      price: def.price,
      mrp: def.mrp || Math.round(def.price * 1.15),
      stock: 50,
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });
  console.log(`Updated variants for ${productId}: ${varDefs.map(v => v.size + ' ₹' + v.price).join(', ')}`);
}

// 2. Aashirvaad Chakki Atta: single card, 4 quantity options
const aashAtta = prods.find(p => p.id === 'g1-p1572');
if (aashAtta) {
  aashAtta.name = 'Aashirvaad Superior MP Shudh Chakki Atta (గోధుమ పిండి)';
  aashAtta.brand = 'Aashirvaad';
  aashAtta.image_url = '/products/packshots/aashirvaad-atta-5kg.jpg';
  aashAtta.imageUrl = '/products/packshots/aashirvaad-atta-5kg.jpg';
  aashAtta.is_active = true;
  aashAtta.isActive = true;
  ensureVariants('g1-p1572', [
    { size: '1 kg', price: 65, mrp: 70 },
    { size: '2 kg', price: 125, mrp: 135 },
    { size: '5 kg', price: 295, mrp: 320 },
    { size: '10 kg', price: 540, mrp: 590 }
  ]);
}
deactivate(['g1-ric017']);

// 3. Tata Sampann Multigrain Atta
const tataAtta = prods.find(p => p.id === 'g1-ric023');
if (tataAtta) {
  tataAtta.name = 'Tata Sampann 100% Multigrain Atta with 6 Natural Grains';
  tataAtta.brand = 'Tata Sampann';
  tataAtta.image_url = '/products/packshots/tata-sampann-multigrain-atta-5kg.webp';
  tataAtta.imageUrl = '/products/packshots/tata-sampann-multigrain-atta-5kg.webp';
  tataAtta.is_active = true;
  tataAtta.isActive = true;
  ensureVariants('g1-ric023', [
    { size: '1 kg', price: 85, mrp: 95 },
    { size: '5 kg', price: 390, mrp: 430 }
  ]);
}
deactivate(['g1-tatasampann-multi-atta']);

// 4. India Gate Feast Rozana Basmati Rice
const igRozana = prods.find(p => p.id === 'g1-indiagate-rozana');
if (igRozana) {
  igRozana.name = 'India Gate Basmati Rice Feast Rozana (బాస్మతి బియ్యం)';
  igRozana.brand = 'India Gate';
  igRozana.image_url = '/products/packshots/india-gate-rozzana-5kg.webp';
  igRozana.imageUrl = '/products/packshots/india-gate-rozzana-5kg.webp';
  igRozana.is_active = true;
  igRozana.isActive = true;
  ensureVariants('g1-indiagate-rozana', [
    { size: '1 kg', price: 115, mrp: 130 },
    { size: '5 kg', price: 525, mrp: 590 }
  ]);
}
deactivate(['g1-p0411', 'g1-ric003']);

// 5. India Gate Classic Basmati Rice
const igClassic = prods.find(p => p.id === 'g1-indiagate-classic');
if (igClassic) {
  igClassic.name = 'India Gate Basmati Rice Classic Aged (ప్రీమియం బాస్మతి)';
  igClassic.brand = 'India Gate';
  igClassic.image_url = '/products/packshots/india-gate-classic-5kg.webp';
  igClassic.imageUrl = '/products/packshots/india-gate-classic-5kg.webp';
  igClassic.is_active = true;
  igClassic.isActive = true;
  ensureVariants('g1-indiagate-classic', [
    { size: '1 kg', price: 240, mrp: 270 },
    { size: '5 kg', price: 1150, mrp: 1250 }
  ]);
}
deactivate(['g1-ric001']);

// 6. Daawat Basmati Rice
const daawat = prods.find(p => p.id === 'g1-daawat-rozana');
if (daawat) {
  daawat.name = 'Daawat Rozana Super Basmati Rice';
  daawat.brand = 'Daawat';
  daawat.image_url = '/products/packshots/daawat-rozana-super-5kg.webp';
  daawat.imageUrl = '/products/packshots/daawat-rozana-super-5kg.webp';
  daawat.is_active = true;
  daawat.isActive = true;
  ensureVariants('g1-daawat-rozana', [
    { size: '1 kg', price: 115, mrp: 130 },
    { size: '5 kg', price: 545, mrp: 600 }
  ]);
}
deactivate(['g1-ric006']);

// 7. G1 Mart Sona Masoori Raw Rice
const g1Rice = prods.find(p => p.id === 'g1-p0219');
if (g1Rice) {
  g1Rice.name = 'G1 Mart Premium Sona Masoori Raw Rice (సోనా మసూరి బియ్యం)';
  g1Rice.brand = 'G1 Mart';
  g1Rice.image_url = '/products/generated_pouches/g1_rice_pouch.webp';
  g1Rice.imageUrl = '/products/generated_pouches/g1_rice_pouch.webp';
  g1Rice.is_active = true;
  g1Rice.isActive = true;
  ensureVariants('g1-p0219', [
    { size: '1 kg', price: 62, mrp: 70 },
    { size: '5 kg', price: 295, mrp: 325 },
    { size: '10 kg', price: 575, mrp: 630 },
    { size: '25 kg', price: 1380, mrp: 1500 }
  ]);
}
deactivate(['g1-ric038']);

// 8. G1 Mart Doddu Atukulu (Thick Poha)
const g1Poha = prods.find(p => p.id === 'g1-sug020');
if (g1Poha) {
  g1Poha.name = 'G1 Mart Doddu Atukulu (Thick Poha / దొడ్డు అటుకులు)';
  g1Poha.brand = 'G1 Mart';
  g1Poha.image_url = '/products/generated_pouches/g1_poha_pouch.webp';
  g1Poha.imageUrl = '/products/generated_pouches/g1_poha_pouch.webp';
  g1Poha.is_active = true;
  g1Poha.isActive = true;
  ensureVariants('g1-sug020', [
    { size: '500 g', price: 35, mrp: 40 },
    { size: '1 kg', price: 65, mrp: 75 }
  ]);
}
deactivate(['g1-p0417']);

// 9. G1 Mart Sabudana / Saggubiyyam
const g1Saggubiyyam = prods.find(p => p.id === 'g1-sug023');
if (g1Saggubiyyam) {
  g1Saggubiyyam.name = 'G1 Mart Saggubiyyam (Medium Sabudana / సగ్గుబియ్యం)';
  g1Saggubiyyam.brand = 'G1 Mart';
  g1Saggubiyyam.image_url = '/products/generated_pouches/g1_sabudana_pouch.webp';
  g1Saggubiyyam.imageUrl = '/products/generated_pouches/g1_sabudana_pouch.webp';
  g1Saggubiyyam.is_active = true;
  g1Saggubiyyam.isActive = true;
  ensureVariants('g1-sug023', [
    { size: '500 g', price: 48, mrp: 55 },
    { size: '1 kg', price: 92, mrp: 105 }
  ]);
}
deactivate(['g1-p0728']);

// 10. G1 Mart Bansi Rava
const g1Bansi = prods.find(p => p.id === 'g1-ric043');
if (g1Bansi) {
  g1Bansi.name = 'G1 Mart Bansi Ravva / Wheat Rava (బాన్సీ రవ్వ)';
  g1Bansi.brand = 'G1 Mart';
  g1Bansi.image_url = '/products/generated_pouches/g1_bansi_rava_pouch.webp';
  g1Bansi.imageUrl = '/products/generated_pouches/g1_bansi_rava_pouch.webp';
  g1Bansi.is_active = true;
  g1Bansi.isActive = true;
  ensureVariants('g1-ric043', [
    { size: '500 g', price: 32, mrp: 38 },
    { size: '1 kg', price: 48, mrp: 55 }
  ]);
}
deactivate(['g1-p0196', 'g1-javva-wheat-rava']);

// 11. G1 Mart Upma Rava
const g1Upma = prods.find(p => p.id === 'g1-ric042');
if (g1Upma) {
  g1Upma.name = 'G1 Mart Upma Ravva / Bombay Rava (ఉప్మా రవ్వ)';
  g1Upma.brand = 'G1 Mart';
  g1Upma.image_url = '/products/generated_pouches/g1_upma_rava_pouch.webp';
  g1Upma.imageUrl = '/products/generated_pouches/g1_upma_rava_pouch.webp';
  g1Upma.is_active = true;
  g1Upma.isActive = true;
  ensureVariants('g1-ric042', [
    { size: '500 g', price: 32, mrp: 38 },
    { size: '1 kg', price: 45, mrp: 52 }
  ]);
}
deactivate(['g1-p0427', 'g1-dharani-upma-rava']);

// 12. G1 Mart Rice Flour
const g1RiceFlour = prods.find(p => p.id === 'g1-ric044');
if (g1RiceFlour) {
  g1RiceFlour.name = 'G1 Mart Rice Flour / Biyyapu Pindi (బియ్యం పిండి)';
  g1RiceFlour.brand = 'G1 Mart';
  g1RiceFlour.image_url = '/products/generated_pouches/g1_rice_flour_pouch.webp';
  g1RiceFlour.imageUrl = '/products/generated_pouches/g1_rice_flour_pouch.webp';
  g1RiceFlour.is_active = true;
  g1RiceFlour.isActive = true;
  ensureVariants('g1-ric044', [
    { size: '500 g', price: 28, mrp: 35 },
    { size: '1 kg', price: 45, mrp: 55 }
  ]);
}
deactivate(['g1-p0063']);

// 13. G1 Mart Ragi Flour
const g1RagiFlour = prods.find(p => p.id === 'g1-ric045');
if (g1RagiFlour) {
  g1RagiFlour.name = 'G1 Mart Pure Ragi Flour / Ragi Pindi (రాగి పిండి)';
  g1RagiFlour.brand = 'G1 Mart';
  g1RagiFlour.image_url = '/products/generated_pouches/g1_ragi_flour_pouch.webp';
  g1RagiFlour.imageUrl = '/products/generated_pouches/g1_ragi_flour_pouch.webp';
  g1RagiFlour.is_active = true;
  g1RagiFlour.isActive = true;
  ensureVariants('g1-ric045', [
    { size: '500 g', price: 38, mrp: 45 },
    { size: '1 kg', price: 50, mrp: 60 }
  ]);
}
deactivate(['g1-p0704']);

// 14. Millets: Korralu, Sajjalu, Jowar, Whole Ragi
const korralu = prods.find(p => p.id === 'g1-ric050');
if (korralu) {
  korralu.name = 'G1 Mart Foxtail Millet / Korralu (కొర్రలు)';
  korralu.brand = 'G1 Mart';
  korralu.image_url = '/products/generated_pouches/g1_korralu_pouch.webp';
  korralu.is_active = true;
  korralu.isActive = true;
  ensureVariants('g1-ric050', [
    { size: '500 g', price: 50, mrp: 58 },
    { size: '1 kg', price: 75, mrp: 88 }
  ]);
}
deactivate(['g1-p0080']);

const sajjalu = prods.find(p => p.id === 'g1-ric048');
if (sajjalu) {
  sajjalu.name = 'G1 Mart Pearl Millet / Sajjalu (సజ్జలు)';
  sajjalu.brand = 'G1 Mart';
  sajjalu.image_url = '/products/generated_pouches/g1_sajjalu_pouch.webp';
  sajjalu.is_active = true;
  sajjalu.isActive = true;
  ensureVariants('g1-ric048', [
    { size: '500 g', price: 40, mrp: 48 },
    { size: '1 kg', price: 45, mrp: 55 }
  ]);
}
deactivate(['g1-p0203']);

const jowar = prods.find(p => p.id === 'g1-ric047');
if (jowar) {
  jowar.name = 'G1 Mart Sorghum / Jowar Grains (జొన్నలు)';
  jowar.brand = 'G1 Mart';
  jowar.image_url = '/products/generated_pouches/g1_jowar_pouch.webp';
  jowar.is_active = true;
  jowar.isActive = true;
  ensureVariants('g1-ric047', [
    { size: '500 g', price: 40, mrp: 48 },
    { size: '1 kg', price: 55, mrp: 65 }
  ]);
}
deactivate(['g1-p0407']);

const wholeRagi = prods.find(p => p.id === 'g1-ric049');
if (wholeRagi) {
  wholeRagi.name = 'G1 Mart Finger Millet / Whole Ragi (రాగులు)';
  wholeRagi.brand = 'G1 Mart';
  wholeRagi.image_url = '/products/generated_pouches/g1_whole_ragi_pouch.webp';
  wholeRagi.is_active = true;
  wholeRagi.isActive = true;
  ensureVariants('g1-ric049', [
    { size: '500 g', price: 35, mrp: 42 },
    { size: '1 kg', price: 45, mrp: 55 }
  ]);
}
deactivate(['g1-p0409']);

// 15. Corn Flour
const cornFlour = prods.find(p => p.id === 'g1-p0197');
if (cornFlour) {
  cornFlour.name = 'G1 Mart Pure Corn Flour (మొక్కజొన్న పిండి)';
  cornFlour.brand = 'G1 Mart';
  cornFlour.image_url = '/products/generated_pouches/g1_corn_flour_pouch.webp';
  cornFlour.is_active = true;
  cornFlour.isActive = true;
  ensureVariants('g1-p0197', [
    { size: '500 g', price: 32, mrp: 38 },
    { size: '1 kg', price: 60, mrp: 70 }
  ]);
}
deactivate(['g1-dharani-corn-flour']);

// 16. Dals & Pulses: Minapa Gundu (Whole White Urad)
const minapaGundu = prods.find(p => p.id === 'g1-dal022');
if (minapaGundu) {
  minapaGundu.name = 'G1 Mart Minapa Gundu (Whole White Urad / మినప గుండ్లు)';
  minapaGundu.brand = 'G1 Mart';
  minapaGundu.image_url = '/products/generated_pouches/g1_minapa_gundu_pouch.webp';
  minapaGundu.is_active = true;
  minapaGundu.isActive = true;
  ensureVariants('g1-dal022', [
    { size: '500 g', price: 75, mrp: 85 },
    { size: '1 kg', price: 145, mrp: 160 },
    { size: '2 kg', price: 285, mrp: 315 },
    { size: '5 kg', price: 695, mrp: 775 }
  ]);
}
deactivate(['g1-p0391']);

// 17. Ensure G1 Mart Chakki Fresh Atta and Maida use the new regenerated pouches
const g1ChakkiAtta = prods.find(p => p.id === 'g1-p0198');
if (g1ChakkiAtta) {
  g1ChakkiAtta.name = 'G1 Mart Chakki Fresh Whole Wheat Atta (గోధుమ పిండి)';
  g1ChakkiAtta.brand = 'G1 Mart';
  g1ChakkiAtta.image_url = '/products/generated_pouches/g1_atta_pouch.webp';
  g1ChakkiAtta.imageUrl = '/products/generated_pouches/g1_atta_pouch.webp';
  ensureVariants('g1-p0198', [
    { size: '1 kg', price: 50, mrp: 58 },
    { size: '5 kg', price: 240, mrp: 275 }
  ]);
}

const g1Maida = prods.find(p => p.id === 'g1-p1030');
if (g1Maida) {
  g1Maida.name = 'G1 Mart Maida Pindi / Refined Wheat Flour (మైదా)';
  g1Maida.brand = 'G1 Mart';
  g1Maida.image_url = '/products/generated_pouches/g1_maida_pouch.webp';
  g1Maida.imageUrl = '/products/generated_pouches/g1_maida_pouch.webp';
  ensureVariants('g1-p1030', [
    { size: '500 g', price: 28, mrp: 35 },
    { size: '1 kg', price: 50, mrp: 60 }
  ]);
}

// 18. Save back both JSON files
fs.writeFileSync(prodsPath, JSON.stringify(prods, null, 2), 'utf8');
fs.writeFileSync(varsPath, JSON.stringify(variants, null, 2), 'utf8');

console.log('Successfully updated migrated_products.json and migrated_product_variants.json!');

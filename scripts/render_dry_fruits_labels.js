const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const labels = [
  {
    id: 'badam',
    title: 'Badam Pappu',
    subtitle: '(California Almonds)',
    telugu: 'బాదం పప్పు',
    weight: 'NET WT: 500g'
  },
  {
    id: 'cashews',
    title: 'Jeedipappu',
    subtitle: '(Premium Cashews)',
    telugu: 'జీడిపప్పు',
    weight: 'NET WT: 500g'
  },
  {
    id: 'pista',
    title: 'Salted Pistachios',
    subtitle: '(Pista Pappu)',
    telugu: 'పిస్తా పప్పు',
    weight: 'NET WT: 250g'
  },
  {
    id: 'kismis',
    title: 'Golden Raisins',
    subtitle: '(Sweet Kismis)',
    telugu: 'కిస్మిస్',
    weight: 'NET WT: 250g'
  },
  {
    id: 'dates',
    title: 'Endu Kharjuram',
    subtitle: '(Dry Hard Dates)',
    telugu: 'ఎండు ఖర్జూరం',
    weight: 'NET WT: 500g'
  },
  {
    id: 'makhana',
    title: 'Phool Makhana',
    subtitle: '(Lotus Seeds)',
    telugu: 'పూల్ మఖానా',
    weight: 'NET WT: 250g'
  },
  {
    id: 'sunflower_seeds',
    title: 'Sunflower Seeds',
    subtitle: '(Poddutirugudu Ginjalu)',
    telugu: 'పొద్దుతిరుగుడు గింజలు',
    weight: 'NET WT: 250g'
  },
  {
    id: 'pumpkin_seeds',
    title: 'Pumpkin Seeds',
    subtitle: '(Gummadi Ginjalu)',
    telugu: 'గుమ్మడి గింజలు',
    weight: 'NET WT: 250g'
  },
  {
    id: 'muskmelon_seeds',
    title: 'Muskmelon Seeds',
    subtitle: '(Kharbuja Ginjalu)',
    telugu: 'ఖర్బూజ గింజలు',
    weight: 'NET WT: 250g'
  },
  {
    id: 'watermelon_seeds',
    title: 'Watermelon Seeds',
    subtitle: '(Puchakaya Ginjalu)',
    telugu: 'పుచ్చకాయ గింజలు',
    weight: 'NET WT: 250g'
  }
];

const outDir = path.resolve('scratch_dry_fruits_labels');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function renderLabels() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  for (const item of labels) {
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 20px;
    background: transparent;
    display: inline-block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .label-card {
    width: 240px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.06);
    padding: 16px 14px 14px 14px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .brand-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 12px;
  }
  .logo-icon {
    width: 32px;
    height: 24px;
  }
  .brand-text {
    font-size: 17px;
    font-weight: 800;
    color: #15803d;
    letter-spacing: 0.5px;
    font-family: 'Arial Black', Arial, sans-serif;
  }
  .prod-title {
    font-size: 15px;
    font-weight: 800;
    color: #064e3b;
    margin-bottom: 2px;
    line-height: 1.2;
  }
  .prod-subtitle {
    font-size: 11px;
    font-weight: 600;
    color: #047857;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  .prod-telugu {
    font-family: 'Nirmala UI', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #064e3b;
    margin-bottom: 14px;
    line-height: 1.3;
  }
  .divider {
    width: 85%;
    height: 1px;
    background: #e5e7eb;
    margin-bottom: 8px;
  }
  .prod-weight {
    font-size: 10px;
    font-weight: 800;
    color: #1f2937;
    letter-spacing: 0.8px;
  }
</style>
</head>
<body>
  <div class="label-card" id="card">
    <div class="brand-logo-wrap">
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 2c2 1 3 3 3 5-2-1-3-3-3-5z" fill="#22c55e"/>
        <path d="M12 2c-2 1-3 3-3 5 2-1 3-3 3-5z" fill="#16a34a"/>
        <text x="7" y="11" font-size="5" font-weight="900" fill="#15803d" font-family="Arial">G1</text>
      </svg>
      <span class="brand-text">G1 MART</span>
    </div>
    <div class="prod-title">${item.title}</div>
    <div class="prod-subtitle">${item.subtitle}</div>
    <div class="prod-telugu">${item.telugu}</div>
    <div class="divider"></div>
    <div class="prod-weight">${item.weight}</div>
  </div>
</body>
</html>
    `;

    await page.setContent(html);
    const element = await page.$('#card');
    const outPath = path.join(outDir, `label_${item.id}.png`);
    await element.screenshot({ path: outPath, omitBackground: true });
    console.log(`Rendered: label_${item.id}.png`);
  }

  await browser.close();
  console.log('All dry fruit labels rendered successfully!');
}

renderLabels().catch(console.error);

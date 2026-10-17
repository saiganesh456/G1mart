const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const labels = [
  {
    id: 'miriyalu',
    title: 'Black Pepper',
    subtitle: '(Miriyalu)',
    telugu: 'మిరియాలు',
    weight: 'NET WT: 100g'
  },
  {
    id: 'dalchini',
    title: 'Cinnamon Sticks',
    subtitle: '(Dalchina Chekka)',
    telugu: 'దాల్చిన చెక్క',
    weight: 'NET WT: 50g'
  },
  {
    id: 'nuvvulu',
    title: 'White Sesame',
    subtitle: '(Tella Nuvvulu)',
    telugu: 'తెల్ల నువ్వులు',
    weight: 'NET WT: 250g'
  },
  {
    id: 'lavangalu',
    title: 'Whole Cloves',
    subtitle: '(Lavangalu)',
    telugu: 'లవంగాలు',
    weight: 'NET WT: 50g'
  },
  {
    id: 'vamu',
    title: 'Ajwain Seeds',
    subtitle: '(Carom Seeds / Vamu)',
    telugu: 'వాము',
    weight: 'NET WT: 100g'
  },
  {
    id: 'nalla_karam',
    title: 'Nellore Nalla Karam',
    subtitle: '(Garlic Chutney Podi)',
    telugu: 'నల్ల కారం పొడి',
    weight: 'NET WT: 100g'
  },
  {
    id: 'jeera',
    title: 'Cumin Seeds',
    subtitle: '(Jeelakarra)',
    telugu: 'జీలకర్ర',
    weight: 'NET WT: 100g'
  },
  {
    id: 'dry_mirchi',
    title: 'Guntur Dry Mirchi',
    subtitle: '(Dried Red Chillies)',
    telugu: 'ఎండు మిర్చి',
    weight: 'NET WT: 250g'
  },
  {
    id: 'elaichi',
    title: 'Green Cardamom',
    subtitle: '(Elakulu)',
    telugu: 'యాలకులు',
    weight: 'NET WT: 50g'
  },
  {
    id: 'avalu',
    title: 'Mustard Seeds',
    subtitle: '(Avalu)',
    telugu: 'ఆవాలు',
    weight: 'NET WT: 100g'
  }
];

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 600, height: 700 }, deviceScaleFactor: 2 });

  // Read logo as base64
  const logoData = fs.readFileSync('scratch_perfect_logo.png').toString('base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  const outDir = path.join(__dirname, '..', 'scratch_spice_labels');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const item of labels) {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 500px;
          height: 600px;
        }
        .card {
          width: 236px;
          min-height: 290px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
          border: 1px solid #d9e4dc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 16px 12px 14px 12px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .logo-img {
          width: 155px;
          height: auto;
          margin-bottom: 4px;
        }
        .titles-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          padding: 4px 0;
        }
        .title {
          font-size: 19px;
          font-weight: 800;
          color: #074522;
          line-height: 1.15;
          letter-spacing: -0.2px;
        }
        .subtitle {
          font-size: 15px;
          font-weight: 700;
          color: #0c562b;
          line-height: 1.2;
          margin-top: 3px;
        }
        .telugu {
          font-size: 24px;
          font-weight: 700;
          color: #1e3b22;
          font-family: "Nirmala UI", "Gautami", sans-serif;
          margin-top: 8px;
          line-height: 1.2;
        }
        .divider {
          width: 80%;
          height: 1px;
          background: #e5ece6;
          margin: 6px 0;
        }
        .weight {
          font-size: 13.5px;
          font-weight: 800;
          color: #18221a;
          letter-spacing: 0.5px;
          padding-top: 2px;
        }
      </style>
    </head>
    <body>
      <div class="card" id="card">
        <img class="logo-img" src="${logoSrc}" alt="G1 Mart" />
        <div class="titles-box">
          <div class="title">${item.title}</div>
          <div class="subtitle">${item.subtitle}</div>
          <div class="telugu">${item.telugu}</div>
        </div>
        <div class="divider"></div>
        <div class="weight">${item.weight}</div>
      </div>
    </body>
    </html>`;

    await page.setContent(html);
    const cardHandle = await page.$('#card');
    const outPath = path.join(outDir, `label_${item.id}.png`);
    await cardHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Rendered label: ${outPath}`);
  }

  await browser.close();
  console.log('All 10 spice labels rendered perfectly!');
}

run().catch(console.error);

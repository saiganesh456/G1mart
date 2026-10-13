const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const labels = [
  {
    id: 'yellow_moong',
    title: 'Yellow Moong Dal',
    subtitle: '(Pesara Pappu)',
    telugu: 'పెసరపప్పు',
    weight: 'NET WT: 1 KG'
  },
  {
    id: 'masoor_dal',
    title: 'Red Lentils',
    subtitle: '(Masoor Dal)',
    telugu: 'ఎర్ర కందిపప్పు',
    weight: 'NET WT: 1 KG'
  },
  {
    id: 'green_moong',
    title: 'Green Moong Whole',
    subtitle: '(Pesalu)',
    telugu: 'పెసలు',
    weight: 'NET WT: 1 KG'
  },
  {
    id: 'alasandalu',
    title: 'Alasandalu',
    subtitle: '(Black-Eyed Peas)',
    telugu: 'అలసందలు',
    weight: 'NET WT: 1 KG'
  },
  {
    id: 'tella_bataneelu',
    title: 'Tella Bataneelu',
    subtitle: '(White Peas)',
    telugu: 'తెల్ల బఠానీలు',
    weight: 'NET WT: 1 KG'
  },
  {
    id: 'telagapindi',
    title: 'Telagapindi',
    subtitle: '(Sesame Press)',
    telugu: 'తెలగపిండి',
    weight: 'NET WT: 500 G'
  }
];

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 500, height: 600 }, deviceScaleFactor: 2 });

  // Read logo as base64
  const logoData = fs.readFileSync('scratch_perfect_logo.png').toString('base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

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
          width: 228px;
          height: 294px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
          border: 1px solid #e2e8e2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 16px 10px 14px 10px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .logo-img {
          width: 155px;
          height: auto;
          margin-bottom: 2px;
        }
        .titles-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
        }
        .title {
          font-size: 19px;
          font-weight: 700;
          color: #074522;
          line-height: 1.15;
          letter-spacing: -0.2px;
        }
        .subtitle {
          font-size: 16px;
          font-weight: 700;
          color: #074522;
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
        .weight {
          font-size: 13.5px;
          font-weight: 800;
          color: #18221a;
          letter-spacing: 0.4px;
          padding-top: 4px;
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
        <div class="weight">${item.weight}</div>
      </div>
    </body>
    </html>`;

    await page.setContent(html);
    const cardHandle = await page.$('#card');
    const outPath = `scratch_label_${item.id}.png`;
    await cardHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Rendered label: ${outPath}`);
  }

  await browser.close();
}

run().catch(console.error);

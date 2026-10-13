const http = require('http');

function check(url, regex, label) {
  return new Promise(resolve => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const matches = data.match(regex) || [];
        const unique = Array.from(new Set(matches));
        console.log(`${label} - Status: ${res.statusCode}, Found: ${matches.length}, Unique: ${unique.length}`);
        console.log('Sample:', unique.slice(0, 6));
        resolve();
      });
    }).on('error', e => {
      console.log(`${label} Error:`, e.message);
      resolve();
    });
  });
}

async function run() {
  await check('http://localhost:3000/category/chips-namkeen', /\/products\/verified\/snk-[^"'\s]+/g, 'CHIPS & NAMKEEN');
  await check('http://localhost:3000/category/biscuits-bakery', /\/products\/verified\/bsc-[^"'\s]+/g, 'BISCUITS & BAKERY');
}

run();

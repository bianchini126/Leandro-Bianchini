const https = require('https');

const pinId = '105060603802470158';
const url = `https://www.pinterest.com/pin/${pinId}/`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('pin.html', data);
    console.log('Saved to pin.html');
  });
});

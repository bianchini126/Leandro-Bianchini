const https = require('https');
const fs = require('fs');

const pinIds = JSON.parse(fs.readFileSync('pinterest_ids.json', 'utf8'));

async function getGifUrl(pinId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.pinterest.com/pin/${pinId}/`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9./_-]+\.gif/);
        if (match) {
          resolve(match[0]);
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const result = {};
  for (const [muscle, ids] of Object.entries(pinIds)) {
    result[muscle] = [];
    for (const id of ids) {
      try {
        const gifUrl = await getGifUrl(id);
        if (gifUrl) {
          result[muscle].push(gifUrl);
          console.log(id, '->', gifUrl);
        } else {
          console.log(id, '-> No GIF found');
        }
      } catch (e) {
        console.error(id, 'error', e.message);
      }
    }
  }
  fs.writeFileSync('pinterest_gifs.json', JSON.stringify(result, null, 2));
  console.log('Done!');
}

run();

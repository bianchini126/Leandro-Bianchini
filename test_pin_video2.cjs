const https = require('https');

const pinId = '105060603802470158';
const url = `https://www.pinterest.com/pin/${pinId}/`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      const str = JSON.stringify(json);
      const mp4Matches = str.match(/https:\/\/[^"']*\.mp4/g);
      console.log('MP4:', mp4Matches ? mp4Matches[0] : 'None');
    } else {
      console.log('No PWS_DATA found');
    }
  });
});

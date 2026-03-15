const https = require('https');

const pinId = '105060603802470158';
const url = `https://www.pinterest.com/pin/${pinId}/`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const mp4Matches = data.match(/https:\/\/[^"']*\.mp4/g);
    const m3u8Matches = data.match(/https:\/\/[^"']*\.m3u8/g);
    console.log('MP4:', mp4Matches ? mp4Matches[0] : 'None');
    console.log('M3U8:', m3u8Matches ? m3u8Matches[0] : 'None');
  });
});

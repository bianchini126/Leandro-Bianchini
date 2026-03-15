import https from 'https';

const urls = [
  'https://edge15.streamonkey.net/energy-fitness?aggregator=radiode',
  'https://frontend.streamonkey.net/energy-pop/stream/mp3?aggregator=radiode',
  'https://e-spo-103.fabricahost.com.br/metropolitana985sp?f=1773107748N01KKAQA7K84R32RND7Q9NZ706K&tid=01KKAQA7K8NJECJESFEKHXRD7X',
  'https://listen.181fm.com/181-hardrock_128k.mp3',
  'https://strm112.1.fm/atr_mobile_mp3',
  'https://listenssl.ibizaglobalradio.com:8024/stream',
  'https://listen.181fm.com/181-beat_128k.mp3',
  'https://strm112.1.fm/dance_mobile_mp3',
  'https://listen.181fm.com/181-awesome80s_128k.mp3',
  'https://listen.181fm.com/181-90salt_128k.mp3',
  'https://stream.radioparadise.com/mp3-128',
  'https://dancewave.online/dance.mp3',
  'https://ice1.somafm.com/groovesalad-128-mp3',
  'https://stream.zeno.fm/f37n1cr6318uv'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
      res.destroy();
    }).on('error', (e) => {
      resolve({ url, status: 'error', message: e.message });
    });
  });
}

async function run() {
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(result.url, result.status);
  }
}

run();

const https = require('https');
const zlib = require('zlib');

module.exports = async (req, res) => {
  const url = 'https://core-api.kablowebtv.com/api/channels';

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://tvheryerde.com',
      'Origin': 'https://tvheryerde.com',
      'Accept-Encoding': 'gzip',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJMSVZFIiwiaXBiIjoiMCIsImNnZCI6IjA5M2Q3MjBhLTUwMmMtNDFlZC1hODBmLTJiODE2OTg0ZmI5NSIsImNzaCI6IlRSS1NUIiwiZGN0IjoiM0VGNzUiLCJkaSI6ImE2OTliODNmLTgyNmItNGQ5OS05MzYxLWM4YTMxMzIxOGQ0NiIsInNnZCI6Ijg5NzQxZmVjLTFkMzMtNGMwMC1hZmNkLTNmZGFmZTBiNmEyZCIsInNwZ2QiOiIxNTJiZDUzOS02MjIwLTQ0MjctYTkxNS1iZjRiZDA2OGQ3ZTgiLCJpY2giOiIwIiwiaWRtIjoiMCIsImlhIjoiOjpmZmZmOjEwLjAuMC4yMDYiLCJhcHYiOiIxLjAuMCIsImFibiI6IjEwMDAiLCJuYmYiOjE3NDUxNTI4MjUsImV4cCI6MTc0NTE1Mjg4NSwiaWF0IjoxNzQ1MTUyODI1fQ.OSlafRMxef4EjHG5t6TqfAQC7y05IiQjwwgf6yMUS9E'
    }
  };

  try {
    https.get(url, options, (response) => {
      let chunks = [];

      const encoding = response.headers['content-encoding'];
      const stream = encoding === 'gzip' ? response.pipe(zlib.createGunzip()) : response;

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString();
          const data = JSON.parse(body);

          const channels = data.Data?.AllChannels || [];
          let m3u = '#EXTM3U\n';

          channels.forEach((channel) => {
            const name = channel?.Name;
            const hls = channel?.StreamData?.HlsStreamUrl;
            const logo = channel?.PrimaryLogoImageUrl || '';
            const category = channel?.Categories?.[0]?.Name || 'Genel';

            if (!name || !hls || category === 'Bilgilendirme') return;

            m3u += `#EXTINF:-1 tvg-logo="${logo}" group-title="${category}",${name}\n${hls}\n`;
          });

          res.setHeader('Content-Type', 'application/x-mpegURL');
          res.status(200).send(m3u);
        } catch (e) {
          res.status(500).send('Hata: JSON parse edilemedi.');
        }
      });
    }).on('error', (err) => {
      res.status(500).send('İstek hatası: ' + err.message);
    });
  } catch (err) {
    res.status(500).send('Sunucu hatası: ' + err.message);
  }
};

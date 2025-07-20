import fetch from "node-fetch";

export default async function handler(req, res) {
  const url = "https://core-api.kablowebtv.com/api/channels";
  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://tvheryerde.com",
    "Origin": "https://tvheryerde.com",
    "Accept-Encoding": "gzip",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJMSVZFIiwiaXBiIjoiMCIsImNnZCI6IjA5M2Q3MjBhLTUwMmMtNDFlZC1hODBmLTJiODE2OTg0ZmI5NSIsImNzaCI6IlRSS1NUIiwiZGN0IjoiM0VGNzUiLCJkaSI6ImE2OTliODNmLTgyNmItNGQ5OS05MzYxLWM4YTMxMzIxOGQ0NiIsInNnZCI6Ijg5NzQxZmVjLTFkMzMtNGMwMC1hZmNkLTNmZGFmZTBiNmEyZCIsInNwZ2QiOiIxNTJiZDUzOS02MjIwLTQ0MjctYTkxNS1iZjRiZDA2OGQ3ZTgiLCJpY2giOiIwIiwiaWRtIjoiMCIsImlhIjoiOjpmZmZmOjEwLjAuMC4yMDYiLCJhcHYiOiIxLjAuMCIsImFibiI6IjEwMDAiLCJuYmYiOjE3NDUxNTI4MjUsImV4cCI6MTc0NTE1Mjg4NSwiaWF0IjoxNzQ1MTUyODI1fQ.OSlafRMxef4EjHG5t6TqfAQC7y05IiQjwwgf6yMUS9E"
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const contentEncoding = response.headers.get("content-encoding");

    let text;
    if (contentEncoding && contentEncoding.includes("gzip")) {
      // Genelde Vercel otomatik açıyor ama eğer açmazsa buraya gzip açma kodu eklenmeli
      text = Buffer.from(buffer).toString("utf-8");
    } else {
      text = Buffer.from(buffer).toString("utf-8");
    }

    const data = JSON.parse(text);
    const channels = data.Data.AllChannels;

    let m3u = "#EXTM3U\n";

    for (const channel of channels) {
      const name = channel.Name;
      const stream_data = channel.StreamData || {};
      const hls_url = stream_data.HlsStreamUrl;
      const logo = channel.PrimaryLogoImageUrl || "";
      const categories = channel.Categories || [];

      if (!name || !hls_url) continue;

      const group = categories.length > 0 ? categories[0].Name || "Genel" : "Genel";
      if (group === "Bilgilendirme") continue;

      m3u += `#EXTINF:-1 tvg-logo="${logo}" group-title="${group}",${name}\n${hls_url}\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.status(200).send(m3u);

  } catch (e) {
    console.error("Hata:", e);
    res.status(500).send(`Hata oluştu: ${e.message}`);
  }
}

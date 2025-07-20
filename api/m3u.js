// ESM formatında düzgün çalışan versiyon
import fetch from 'node-fetch';

export const config = {
  runtime: 'edge', // Vercel Edge Functions için
};

export default async function handler(request) {
  const url = "https://core-api.kablowebtv.com/api/channels";
  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://tvheryerde.com",
    "Origin": "https://tvheryerde.com",
    "Accept-Encoding": "gzip",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJMSVZFIiwiaXBiIjoiMCIsImNnZCI6IjA5M2Q3MjBhLTUwMmMtNDFlZC1hODBmLTJiODE2OTg0ZmI5NSIsImNzaCI6IlRSS1NUIiwiZGN0IjoiM0VGNzUiLCJkaSI6ImE2OTliODNmLTgyNmItNGQ5OS05MzYxLWM4YTMxMzIxOGQ0NiIsInNnZCI6Ijg5NzQxZmVjLTFkMzMtNGMwMC1hZmNkLTNmZGFmZTBiNmEyZCIsInNwZ2QiOiIxNTJiZDUzOS02MjIwLTQ0MjctYTkxNS1iZjRiZDA2OGQ3ZTgiLCJpY2giOiIwIiwiaWRtIjoiMCIsImlhIjoiOjpmZmZmOjEwLjAuMC4yMDYiLCJhcHYiOiIxLjAuMCIsImFibiI6IjEwMDAiLCJuYmYiOjE3NDUxNTI4MjUsImV4cCI6MTc0NTE1Mjg4NSwiaWF0IjoxNzQ1MTUyODI1fQ.OSlafRMxef4EjHG5t6TqfAQC7y05IiQjwwgf6yMUS9E"
  };

  try {
    // API'den veri çekme
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Hatası: ${response.status} - ${errorData}`);
      return new Response(JSON.stringify({
        error: "Kanal verileri alınamadı",
        details: errorData
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Yanıtı işleme
    const buffer = await response.arrayBuffer();
    const text = Buffer.from(buffer).toString("utf-8");
    const data = JSON.parse(text);

    // M3U formatını oluşturma
    let m3uContent = "#EXTM3U\n";
    const excludedCategories = ["Bilgilendirme", "Test"];
    
    data.Data.AllChannels.forEach(channel => {
      const { Name, StreamData = {}, PrimaryLogoImageUrl = "", Categories = [] } = channel;
      const hlsUrl = StreamData.HlsStreamUrl;
      
      if (!Name || !hlsUrl) return;
      
      const category = Categories[0]?.Name || "Genel";
      if (excludedCategories.includes(category)) return;
      
      m3uContent += `#EXTINF:-1 tvg-logo="${PrimaryLogoImageUrl}" group-title="${category}",${Name}\n${hlsUrl}\n`;
    });

    // Yanıtı gönderme
    return new Response(m3uContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-mpegURL',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error("Beklenmeyen Hata:", error);
    return new Response(JSON.stringify({
      error: "Sunucu hatası",
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

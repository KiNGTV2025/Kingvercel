import requests, json, gzip
from io import BytesIO
import os

def get_canli_tv_m3u():
    url = "https://core-api.kablowebtv.com/api/channels"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://tvheryerde.com",
        "Origin": "https://tvheryerde.com",
        "Accept-Encoding": "gzip",
        "Authorization": f"Bearer {{os.environ['CANLITV_TOKEN']}}"
    }

    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    try:
        with gzip.GzipFile(fileobj=BytesIO(response.content)) as gz:
            content = gz.read().decode('utf-8')
    except:
        content = response.content.decode('utf-8')

    data = json.loads(content)
    channels = data['Data']['AllChannels']
    os.makedirs("M3UARŞİV", exist_ok=True)

    with open("M3UARŞİV/Kablonet.m3u", "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        for channel in channels:
            name = channel.get('Name')
            stream_data = channel.get('StreamData', {})
            hls_url = stream_data.get('HlsStreamUrl') if stream_data else None
            logo = channel.get('PrimaryLogoImageUrl', '')
            categories = channel.get('Categories', [])

            if not name or not hls_url:
                continue

            group = categories[0].get('Name', 'Genel') if categories else 'Genel'
            if group == "Bilgilendirme":
                continue

            f.write(f'#EXTINF:-1 tvg-logo="{{logo}}" group-title="{{group}}",{{name}}\n')
            f.write(f'{{hls_url}}\n')

if __name__ == "__main__":
    get_canli_tv_m3u()

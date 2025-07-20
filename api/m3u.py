import requests
import json
import gzip
from io import BytesIO

def handler(request):
    url = "https://core-api.kablowebtv.com/api/channels"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://tvheryerde.com",
        "Origin": "https://tvheryerde.com",
        "Accept-Encoding": "gzip",
        "Authorization": f"Bearer {{YOUR_TOKEN_HERE}}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        try:
            with gzip.GzipFile(fileobj=BytesIO(response.content)) as gz:
                content = gz.read().decode('utf-8')
        except:
            content = response.content.decode('utf-8')

        data = json.loads(content)
        channels = data['Data']['AllChannels']
        m3u = "#EXTM3U\n"

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

            m3u += f'#EXTINF:-1 tvg-logo="{{logo}}" group-title="{{group}}",{{name}}\n{{hls_url}}\n'

        return (200, {"Content-Type": "application/x-mpegURL"}, m3u)

    except Exception as e:
        return (500, {}, f"Hata oluştu: {{str(e)}}")

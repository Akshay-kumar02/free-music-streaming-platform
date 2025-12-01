# API Documentation

Complete guide to the APIs used in this music player.

## Table of Contents
- [iTunes Search API](#itunes-search-api)
- [YouTube Data API v3](#youtube-data-api-v3)
- [Implementation Examples](#implementation-examples)

---

## iTunes Search API

### Overview
- **Provider**: Apple Inc.
- **Cost**: FREE (no API key required)
- **Rate Limits**: None (reasonable use)
- **Audio**: 30-second previews
- **Quality**: 128kbps AAC

### Endpoint
```
https://itunes.apple.com/search
```

### Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `term` | Yes | Search query | `beatles` |
| `media` | No | Media type | `music` |
| `entity` | No | Entity type | `song` |
| `limit` | No | Results count (1-200) | `20` |
| `country` | No | Store country | `us` |

### Example Request
```bash
curl "https://itunes.apple.com/search?term=beatles&media=music&entity=song&limit=20"
```

### Example Response
```json
{
  "resultCount": 20,
  "results": [
    {
      "trackId": 401135199,
      "trackName": "Hey Jude",
      "artistName": "The Beatles",
      "collectionName": "1",
      "artworkUrl100": "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/...",
      "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/...",
      "trackTimeMillis": 431333,
      "primaryGenreName": "Rock",
      "releaseDate": "1968-08-26T07:00:00Z",
      "trackViewUrl": "https://music.apple.com/us/album/hey-jude/..."
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `trackId` | number | Unique track identifier |
| `trackName` | string | Song title |
| `artistName` | string | Artist name |
| `collectionName` | string | Album name |
| `artworkUrl100` | string | Album artwork (100x100) |
| `previewUrl` | string | 30-second MP3 preview URL |
| `trackTimeMillis` | number | Full track duration in ms |
| `primaryGenreName` | string | Music genre |
| `releaseDate` | string | Release date (ISO 8601) |
| `trackViewUrl` | string | iTunes store link |

### JavaScript Implementation

```javascript
async function searchITunes(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.results.map(item => ({
    id: item.trackId,
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName,
    artwork: item.artworkUrl100,
    previewUrl: item.previewUrl,
    duration: item.trackTimeMillis,
    genre: item.primaryGenreName
  }));
}
```

### Playing Audio

```javascript
const audio = new Audio(track.previewUrl);
audio.play();

// With controls
audio.addEventListener('ended', () => {
  console.log('Preview ended (30 seconds)');
});

audio.addEventListener('error', (e) => {
  console.error('Playback error:', e);
});
```

### Limitations
- ✅ No API key required
- ✅ No rate limits
- ✅ High-quality metadata
- ⚠️ **30-second previews only**
- ⚠️ Not all songs have previews
- ⚠️ Preview quality: 128kbps AAC

### Best Practices
1. Always check if `previewUrl` exists
2. Filter results: `results.filter(item => item.previewUrl)`
3. Use higher quality artwork: Replace `100x100` with `300x300` or `600x600`
4. Handle missing previews gracefully
5. Cache results to reduce API calls

---

## YouTube Data API v3

### Overview
- **Provider**: Google
- **Cost**: FREE (with quota limits)
- **Rate Limits**: 10,000 units/day
- **API Key**: Required
- **Audio**: Full songs via embed

### Setup

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable "YouTube Data API v3"
   - Create credentials → API Key
   - Copy your API key

2. **Add to Environment**:
   ```bash
   # .env
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Endpoints

#### Search Videos
```
https://www.googleapis.com/youtube/v3/search
```

#### Get Video Details
```
https://www.googleapis.com/youtube/v3/videos
```

### Search Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `part` | Yes | Data to return | `snippet` |
| `q` | Yes | Search query | `beatles official audio` |
| `type` | No | Result type | `video` |
| `videoCategoryId` | No | Category filter | `10` (Music) |
| `maxResults` | No | Results count (1-50) | `20` |
| `key` | Yes | Your API key | `AIza...` |

### Example Request
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=beatles&type=video&videoCategoryId=10&maxResults=20&key=YOUR_API_KEY"
```

### Example Response
```json
{
  "items": [
    {
      "id": {
        "videoId": "A_MjCqQoLLA"
      },
      "snippet": {
        "title": "The Beatles - Hey Jude",
        "channelTitle": "TheBeatlesVEVO",
        "thumbnails": {
          "medium": {
            "url": "https://i.ytimg.com/vi/A_MjCqQoLLA/mqdefault.jpg"
          }
        }
      }
    }
  ]
}
```

### JavaScript Implementation

```javascript
async function searchYouTube(query, apiKey) {
  // Search for videos
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=20&key=${apiKey}`;
  
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  // Get video IDs
  const videoIds = data.items.map(item => item.id.videoId).join(',');
  
  // Get video details (for duration)
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
  
  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();
  
  // Combine data
  return data.items.map((item, index) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    duration: detailsData.items[index]?.contentDetails.duration,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));
}
```

### Playing YouTube Videos

```javascript
// Using iframe embed
const iframe = document.createElement('iframe');
iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
iframe.width = '100%';
iframe.height = '400';
iframe.allow = 'autoplay';
document.body.appendChild(iframe);
```

### Quota Costs

| Operation | Cost (units) |
|-----------|--------------|
| Search | 100 |
| Video details | 1 |
| **Total per search** | **~101** |

**Daily limit**: 10,000 units = ~99 searches

### Limitations
- ⚠️ Requires API key
- ⚠️ 10,000 units/day free tier
- ⚠️ Quota resets midnight Pacific Time
- ⚠️ No direct audio URLs (use embed)
- ⚠️ Autoplay may be blocked by browsers

### Best Practices
1. Cache search results
2. Combine with iTunes for better coverage
3. Monitor quota usage in Google Cloud Console
4. Handle quota exceeded errors gracefully
5. Use YouTube as secondary source

### Error Handling

```javascript
try {
  const results = await searchYouTube(query, apiKey);
} catch (error) {
  if (error.message.includes('403')) {
    console.error('API key invalid or quota exceeded');
  } else if (error.message.includes('400')) {
    console.error('Invalid request parameters');
  } else {
    console.error('YouTube search failed:', error);
  }
  // Fallback to iTunes-only
}
```

---

## Implementation Examples

### Combined Search (iTunes + YouTube)

```javascript
async function searchMusic(query) {
  try {
    // Primary: iTunes (always works, no key needed)
    const itunesResults = await searchITunes(query);
    
    // Optional: YouTube (if API key available)
    let youtubeResults = [];
    if (YOUTUBE_API_KEY) {
      try {
        youtubeResults = await searchYouTube(query, YOUTUBE_API_KEY);
      } catch (error) {
        console.warn('YouTube search failed, using iTunes only');
      }
    }
    
    // Combine: iTunes first (has playable audio)
    return [...itunesResults, ...youtubeResults];
    
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}
```

### Universal Audio Player

```javascript
function playTrack(track) {
  if (track.source === 'itunes') {
    // Play iTunes preview (30 seconds)
    const audio = new Audio(track.previewUrl);
    audio.play();
    
    audio.addEventListener('ended', () => {
      console.log('Preview ended');
      playNext(); // Auto-play next track
    });
    
  } else if (track.source === 'youtube') {
    // Embed YouTube player
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1`;
    document.getElementById('player').appendChild(iframe);
  }
}
```

### Error Recovery

```javascript
async function robustSearch(query) {
  // Try iTunes first
  try {
    const results = await searchITunes(query);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('iTunes failed:', error);
  }
  
  // Fallback to YouTube
  if (YOUTUBE_API_KEY) {
    try {
      return await searchYouTube(query, YOUTUBE_API_KEY);
    } catch (error) {
      console.error('YouTube failed:', error);
    }
  }
  
  throw new Error('All search sources failed');
}
```

---

## Comparison

| Feature | iTunes | YouTube |
|---------|--------|---------|
| **API Key** | ❌ Not required | ✅ Required |
| **Cost** | ✅ Free forever | ✅ Free (with limits) |
| **Rate Limits** | ✅ None | ⚠️ 10,000 units/day |
| **Audio Quality** | 128kbps AAC | Varies |
| **Audio Length** | ⚠️ 30 seconds | ✅ Full songs |
| **Direct Audio** | ✅ Yes (MP3) | ❌ No (embed only) |
| **Metadata** | ✅ Excellent | ✅ Good |
| **Artwork** | ✅ High quality | ✅ Good |
| **Setup Time** | ✅ Instant | ⚠️ 5-10 minutes |

### Recommendation
- **Use iTunes as primary** - Works immediately, no setup
- **Add YouTube as secondary** - For full songs and more results
- **Combine both** - Best user experience

---

## Testing

### Test iTunes API
```bash
curl "https://itunes.apple.com/search?term=beatles&media=music&limit=5"
```

### Test YouTube API
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=beatles&type=video&key=YOUR_API_KEY"
```

### Test in Browser Console
```javascript
// iTunes
fetch('https://itunes.apple.com/search?term=beatles&media=music')
  .then(r => r.json())
  .then(d => console.log(d));

// YouTube
fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=beatles&key=YOUR_KEY')
  .then(r => r.json())
  .then(d => console.log(d));
```

---

## Resources

### iTunes
- [Official Documentation](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
- [Search Examples](https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/)

### YouTube
- [Official Documentation](https://developers.google.com/youtube/v3)
- [API Console](https://console.cloud.google.com/)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

---

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [README.md](README.md)
3. Open GitHub issue with details
# 🎵 AI-Powered Music Player

**Real music streaming with iTunes Search API + optional YouTube integration**

Search ANY song, get 30-second iTunes previews, AI recommendations, create playlists - completely free!
link- https://free-music-streaming-platform.vercel.app/

## ✨ Features

### 🔍 Real Music Search
- **iTunes Search API** - Real songs with 30-second previews (NO API KEY NEEDED!)
- **YouTube integration** - Optional, requires API key
- Search by song name, artist, or album
- High-quality album artwork
- Real-time results

### 🎧 Advanced Playback
- **HTML5 Audio Player** for iTunes tracks
- Full playback controls (play/pause/seek)
- Progress bar with time display
- Volume control
- Auto-play next track
- Queue management

### 🤖 AI Recommendations
- Intelligent song suggestions
- Based on current track
- Auto-queue recommended songs

### 📝 Playlist Management
- Create unlimited playlists
- Add/remove songs
- Play entire playlists
- Persistent storage (localStorage)

### 🎯 Queue System
- Dynamic queue
- Visual queue display
- Next/Previous navigation

### 🎨 Modern UI
- Spotify-inspired design
- Responsive layout
- Real-time visual feedback
- Album artwork display

## 🚀 Quick Start

### Works Immediately (No Setup Required!)

```bash
git clone https://github.com/Akshay-kumar02/free-music-streaming-platform.git
cd free-music-streaming-platform
npm install
npm run dev
```

Open http://localhost:3000 - **Search and play music instantly!**

Uses **iTunes Search API** - no configuration needed, real 30-second previews!

### Optional: Add YouTube Integration

For additional YouTube results:

1. **Get YouTube Data API v3 Key** (Free - 10,000 requests/day)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable "YouTube Data API v3"
   - Create credentials → API Key

2. **Add to Environment**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your key
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Run**
   ```bash
   npm run dev
   ```

Now you'll get iTunes + YouTube results!

## 🎵 How It Works

### Search Flow
1. User searches for a song
2. **iTunes Search API** returns real tracks with:
   - Track name
   - Artist name
   - Album name
   - 30-second preview URL
   - High-quality artwork
   - Genre, release year
3. Optional: YouTube results added if API key provided
4. Display combined results

### Playback Flow
1. User clicks "Play" on iTunes track
2. HTML5 `<audio>` element loads preview URL
3. Audio streams directly from Apple servers
4. Full controls: play/pause, seek, volume
5. Auto-plays next track when finished

### APIs Used

#### iTunes Search API (Primary)
```javascript
// No API key needed!
fetch('https://itunes.apple.com/search?term=beatles&media=music&limit=20')
```

**Returns:**
- `trackName` - Song title
- `artistName` - Artist
- `artworkUrl100` - Album art
- `previewUrl` - 30-second MP3 preview
- `collectionName` - Album name
- `primaryGenreName` - Genre

#### YouTube Data API v3 (Optional)
```javascript
// Requires API key
fetch('https://www.googleapis.com/youtube/v3/search?q=beatles&key=YOUR_KEY')
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Inline CSS (no dependencies)
- **APIs**: 
  - iTunes Search API (primary, no key needed)
  - YouTube Data API v3 (optional)
- **Audio**: HTML5 Audio Element
- **Storage**: localStorage (playlists)

## 📁 Project Structure

```
app/
├── page.tsx                    # Main UI with audio player
├── layout.tsx                  # App layout
├── api/
│   ├── search/route.ts        # iTunes + YouTube search
│   ├── recommendations/route.ts # AI recommendations
│   └── stream/route.ts        # Stream endpoint
```

## 🔑 API Details

### iTunes Search API

**Endpoint**: `https://itunes.apple.com/search`

**Parameters**:
- `term` - Search query
- `media=music` - Music only
- `entity=song` - Songs only
- `limit=20` - Results count

**No API key required!** ✅

**Response**:
```json
{
  "results": [
    {
      "trackId": 123456,
      "trackName": "Hey Jude",
      "artistName": "The Beatles",
      "collectionName": "1",
      "artworkUrl100": "https://...",
      "previewUrl": "https://audio.itunes.apple.com/...",
      "trackTimeMillis": 431333,
      "primaryGenreName": "Rock"
    }
  ]
}
```

### YouTube Data API v3 (Optional)

**Requires**: API Key from Google Cloud Console

**Free Tier**: 10,000 units/day (~100 searches)

**Setup**: Add `YOUTUBE_API_KEY` to `.env`

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Optional: Add YouTube API key in Vercel dashboard
# Settings → Environment Variables
# YOUTUBE_API_KEY = your_key_here
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Railway

```bash
npm i -g @railway/cli
railway up
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t music-player .
docker run -p 3000:3000 music-player
```

## 📱 Usage Guide

### Search Music
1. Type song name, artist, or album
2. Press Enter or click Search
3. Get real iTunes results instantly

### Play Music
1. Click "▶ Play" on any track
2. Player appears at bottom
3. **30-second preview plays** (iTunes limitation)
4. Use seek bar to navigate
5. Adjust volume with slider

### Build Queue
1. Click "+ Queue" to add songs
2. Queue shows in left sidebar
3. Navigate with Previous/Next buttons

### Create Playlists
1. Click "+ New" in Playlists section
2. Name your playlist
3. Add songs using "+ Playlist" button
4. Play entire playlist with ▶ button

## 🔒 Privacy & Legal

### 100% Legal
- ✅ Uses official iTunes Search API
- ✅ 30-second previews (Apple's terms)
- ✅ No content storage or downloading
- ✅ Streams from original sources
- ✅ Optional YouTube embed (official API)

### Privacy
- No user tracking
- No data collection
- No cookies (except essential)
- Playlists stored locally only

## 🚨 Important Notes

### iTunes Preview Limitation
- **30-second previews only** (Apple's policy)
- Full songs require iTunes/Apple Music subscription
- Preview quality: 128kbps AAC

### YouTube Integration
- Optional, requires API key
- Free tier: 10,000 units/day
- Each search = ~100 units
- ~100 searches/day free

### No Hardcoded Songs
```typescript
// ❌ WRONG - Hardcoded
const songs = ['song1.mp3', 'song2.mp3'];

// ✅ CORRECT - Real API
const response = await fetch('https://itunes.apple.com/search?term=beatles');
```

All songs come from real iTunes Search API!

## 🎨 Customization

### Change Colors

**File**: `app/page.tsx`

```typescript
// Primary color (green)
backgroundColor: '#1db954'

// Background
backgroundColor: '#121212'

// Cards
backgroundColor: '#181818'
```

### Add More Sources

**File**: `app/api/search/route.ts`

```typescript
const [itunes, spotify, soundcloud] = await Promise.all([
  searchITunes(query),
  searchSpotify(query),
  searchSoundCloud(query)
]);
```

## 🐛 Troubleshooting

### "No results found"
- Check internet connection
- Try different search terms
- iTunes API might be temporarily down

### Player not working
- Check browser console for errors
- Ensure audio isn't muted
- Try different browser (Chrome/Edge recommended)

### Only 30 seconds playing
- **This is normal!** iTunes provides 30-second previews only
- Full songs require Apple Music subscription

### YouTube not showing
- Add `YOUTUBE_API_KEY` to `.env`
- Verify API key is correct
- Check quota in Google Cloud Console

## 📊 Performance

- **Search**: < 2 seconds (iTunes API)
- **Playback**: Instant (Apple CDN)
- **Audio Quality**: 128kbps AAC
- **Preview Length**: 30 seconds

## 🤝 Contributing

Contributions welcome!

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📝 License

MIT License - Free for personal and commercial use

## 🙏 Credits

- Music: iTunes Search API (Apple)
- Optional: YouTube Data API v3 (Google)
- Design: Spotify-inspired
- Built with: Next.js, React, TypeScript

## 📧 Support

Issues? Questions?
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open GitHub issue
- Include error messages

---

**Enjoy real music streaming with iTunes! 🎵**

Built with ❤️ for music lovers worldwide

**Note**: iTunes provides 30-second previews. For full songs, use Apple Music or add other streaming APIs.

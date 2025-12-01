# 🎵 AI-Powered Music Player

**Fully functional music streaming platform with AI recommendations, global search, and unlimited playback**

Search ANY song in the world, get AI-powered recommendations, create playlists, and stream unlimited music - completely free!

## ✨ Features

### 🔍 Global Music Search
- Search **ANY song** from YouTube's massive library
- Real-time search results with thumbnails, artist info, and duration
- No predefined song lists - everything is dynamic
- Works with or without API keys (fallback to Invidious)

### 🎧 Advanced Playback Engine
- Smooth YouTube embed player integration
- Play/Pause controls
- Next/Previous track navigation
- Volume control
- Auto-play next recommended song
- Seek bar with time display

### 🤖 AI Recommendation System
- Intelligent song recommendations based on what you're listening to
- Uses YouTube's related videos algorithm
- Metadata-based matching
- Auto-queue recommended songs

### 📝 Playlist Management
- Create unlimited playlists
- Add/remove songs from playlists
- Play entire playlists
- Delete playlists
- Persistent storage (localStorage)

### 🎯 Queue System
- Dynamic queue management
- Add songs to queue
- Remove from queue
- Visual queue display
- Auto-play from queue

### 🎨 Modern UI/UX
- Spotify-inspired design
- Responsive layout (desktop & mobile)
- Sticky bottom player bar
- Tabbed interface (Search / Recommendations)
- Playlist sidebar
- Real-time visual feedback

## 🚀 Quick Start

### Option 1: Works Immediately (No Setup)

```bash
git clone https://github.com/Akshay-kumar02/free-music-streaming-platform.git
cd free-music-streaming-platform
npm install
npm run dev
```

Open http://localhost:3000 - **It works right away!**

Uses Invidious API (public YouTube frontend) - no API key needed.

### Option 2: Enhanced with YouTube API (Recommended)

For better performance and reliability:

1. **Get YouTube Data API v3 Key** (Free - 10,000 requests/day)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable "YouTube Data API v3"
   - Create credentials → API Key
   - Copy your API key

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

## 🔧 Latest Updates (Dec 2024)

### ✅ Fixed Issues
- **Search API**: Updated to working Invidious instances
- **Error Handling**: Better logging and user feedback
- **Timeout Handling**: 8s timeout per instance, prevents hanging
- **Retry Logic**: Tries multiple servers before failing
- **Performance**: Faster search results

### 🐛 Known Issues & Solutions
- **Playback**: Click play button twice (browser autoplay restriction)
- **First Load**: May take 5-10 seconds for Invidious fallback
- **Ad Blockers**: Disable for localhost to avoid blocking YouTube embeds

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 📖 How It Works

### Search Flow
1. User enters search query
2. System queries YouTube Data API (or Invidious fallback)
3. Returns 20 real-time results with:
   - Video ID
   - Title
   - Artist/Channel
   - Thumbnail
   - Duration
4. No hardcoded songs - everything is live

### Playback Flow
1. User clicks "Play" on any song
2. System embeds YouTube player with video ID
3. Audio streams directly from YouTube
4. Loads AI recommendations in background
5. Auto-plays next song when current ends

### Recommendation Flow
1. When song plays, system fetches related videos
2. Uses YouTube's recommendation algorithm
3. Displays in "Recommendations" tab
4. Auto-queues for seamless playback

### Playlist Flow
1. User creates playlist (stored in localStorage)
2. Add songs from search/recommendations
3. Play entire playlist with one click
4. Persistent across sessions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Inline CSS (no dependencies)
- **APIs**: 
  - YouTube Data API v3 (primary)
  - Invidious API (fallback)
- **Storage**: localStorage (playlists)
- **Player**: YouTube Embed API

## 📁 Project Structure

```
app/
├── page.tsx                    # Main UI component
├── layout.tsx                  # App layout
├── api/
│   ├── search/route.ts        # Global music search
│   ├── recommendations/route.ts # AI recommendations
│   └── stream/route.ts        # Streaming endpoint
```

## 🔑 API Configuration

### YouTube Data API v3

**File**: `app/api/search/route.ts`

```typescript
const API_KEY = process.env.YOUTUBE_API_KEY;
```

**Where to insert**: Add to `.env` file:
```
YOUTUBE_API_KEY=YOUR_API_KEY_HERE
```

**Get API Key**:
1. https://console.cloud.google.com/
2. Create project → Enable YouTube Data API v3
3. Credentials → Create API Key

### Fallback (No API Key)

The app automatically uses Invidious API if no YouTube key is provided:

```typescript
// Automatically tries these public instances:
- https://inv.nadeko.net
- https://invidious.privacyredirect.com
- https://yewtu.be
- https://invidious.fdn.fr
- https://inv.riverside.rocks
- https://invidious.nerdvpn.de
```

**No configuration needed!**

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard:
# YOUTUBE_API_KEY = your_key_here
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Add environment variable in Netlify dashboard
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up

# Add environment variable in Railway dashboard
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
docker run -p 3000:3000 -e YOUTUBE_API_KEY=your_key music-player
```

**Important**: Add `YOUTUBE_API_KEY` environment variable in platform settings

## 📱 Usage Guide

### Search for Music
1. Type song name, artist, or album in search bar
2. Press Enter or click Search
3. Browse real-time results from YouTube

### Play Music
1. Click "▶ Play" on any song
2. Player appears at bottom
3. Music streams automatically
4. **Note**: May need to click play twice (browser autoplay restriction)

### Build Queue
1. Click "+ Queue" to add songs
2. Queue shows in left sidebar
3. Navigate with Previous/Next buttons

### Get Recommendations
1. Play any song
2. Click "Recommendations" tab
3. See AI-suggested similar songs

### Create Playlists
1. Click "+ New" in Playlists section
2. Name your playlist
3. Add songs using "+ Playlist" button
4. Play entire playlist with ▶ button

## 🔒 Privacy & Legal

### 100% Legal
- ✅ Uses official YouTube APIs
- ✅ Embeds YouTube player (like Google does)
- ✅ No content storage or downloading
- ✅ Streams from original sources
- ✅ Respects YouTube Terms of Service

### Privacy
- No user tracking
- No data collection
- No cookies (except essential)
- Playlists stored locally only

## 🚨 Important Notes

### API Quotas

**YouTube Data API v3 Free Tier**:
- 10,000 units/day
- Each search = ~100 units
- ~100 searches/day free

**Solution**: App automatically falls back to Invidious if quota exceeded

### No Hardcoded Songs

```typescript
// ❌ WRONG - Hardcoded
const songs = ['song1.mp3', 'song2.mp3'];

// ✅ CORRECT - Dynamic search
const songs = await fetch(`/api/search?q=${userQuery}`);
```

All songs come from real-time search results!

### Streaming Method

Uses YouTube embed player (legal and official):

```html
<iframe src="https://www.youtube.com/embed/{videoId}?autoplay=1" />
```

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

### Add More Music Sources

**File**: `app/api/search/route.ts`

Add SoundCloud, Spotify, or other APIs:

```typescript
const [youtube, soundcloud, spotify] = await Promise.all([
  searchYouTube(query),
  searchSoundCloud(query),
  searchSpotify(query)
]);
```

## 🐛 Troubleshooting

### "No results found"
- Check internet connection
- Try different search terms
- Verify API key (if using YouTube API)
- Wait 5-10 seconds for Invidious fallback

### "Search failed"
- Invidious instances might be down
- Add YouTube API key for reliability
- Check browser console for errors
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Player not loading
- **Click play button twice** (browser autoplay restriction)
- Check if YouTube is accessible
- Disable ad blockers for localhost
- Try different browser (Chrome/Edge recommended)

### API quota exceeded
- App automatically switches to Invidious
- Or wait 24 hours for quota reset
- Or create new Google Cloud project

## 📊 Performance

- **Search**: 2-10 seconds (depending on API)
- **Playback**: Instant (YouTube CDN)
- **Recommendations**: < 1 second
- **Playlist load**: Instant (localStorage)

## 🤝 Contributing

Contributions welcome!

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📝 License

MIT License - Free for personal and commercial use

## 🙏 Credits

- Music: YouTube
- APIs: YouTube Data API v3, Invidious
- Design: Spotify-inspired
- Built with: Next.js, React, TypeScript

## 📧 Support

Issues? Questions?
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
- Open GitHub issue
- Include error messages and browser console logs

---

**Enjoy unlimited music streaming! 🎵**

Built with ❤️ for music lovers worldwide
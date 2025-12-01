# 🎵 Free Music Streaming Platform

**Unlimited music streaming - 100% free, no ads, completely legal**

Stream millions of songs from YouTube, SoundCloud, and other legal sources. No subscription required, no limits, no ads.

## ✨ Features

- 🎵 **Unlimited Streaming** - Listen to as much music as you want
- 🔍 **Smart Search** - Find any song, artist, or album
- 📝 **Playlists** - Create and manage your own playlists
- 🎧 **High Quality** - Stream in the best available quality
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🚫 **No Ads** - Completely ad-free experience
- 💰 **100% Free** - No subscription or payment required
- ⚖️ **Legal** - Uses official APIs and legal sources

## 🎯 Music Sources

- **YouTube** - Billions of songs and music videos
- **SoundCloud** - Independent artists and remixes
- **Jamendo** - 500K+ free licensed tracks
- **Free Music Archive** - Creative Commons music

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- API keys (optional but recommended for full functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/Akshay-kumar02/free-music-streaming-platform.git

# Navigate to directory
cd free-music-streaming-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env file
# (Optional - works with mock data without API keys)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys Setup (Optional)

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Add to `.env`: `YOUTUBE_API_KEY=your_key_here`

### SoundCloud API
1. Go to [SoundCloud Developers](https://soundcloud.com/you/apps)
2. Register a new app
3. Get your Client ID
4. Add to `.env`: `SOUNDCLOUD_CLIENT_ID=your_client_id_here`

### Jamendo API (Optional)
1. Go to [Jamendo Developer](https://developer.jamendo.com/)
2. Register and get Client ID
3. Add to `.env`: `JAMENDO_CLIENT_ID=your_client_id_here`

## 📖 How It Works

This platform aggregates music from multiple legal, free sources:

1. **Search**: Queries multiple APIs simultaneously
2. **Stream**: Fetches audio streams from original sources
3. **Play**: Streams directly in your browser
4. **Legal**: All content is accessed through official APIs

**No music is stored on our servers** - everything streams directly from the source platforms.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Inline CSS (Spotify-inspired design)
- **APIs**: YouTube Data API, SoundCloud API
- **Deployment**: Vercel (recommended)

## 📱 Features Breakdown

### Search
- Multi-source search (YouTube, SoundCloud, etc.)
- Real-time results
- Filter by source

### Player
- Play/pause controls
- Seek bar with time display
- Track information display
- Source indicator

### Playlists
- Create custom playlists
- Add/remove tracks
- Play from playlist
- Persistent storage (localStorage)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard:
1. Import GitHub repository
2. Add environment variables
3. Deploy

### Deploy to Other Platforms

Works on any Node.js hosting:
- Netlify
- Railway
- Render
- Heroku

## ⚖️ Legal Notice

This platform is 100% legal because:

- ✅ Uses official APIs from YouTube, SoundCloud, etc.
- ✅ Doesn't store or host any copyrighted content
- ✅ Streams directly from original sources
- ✅ Acts as a search aggregator (like Google)
- ✅ Respects platform terms of service

**Similar to how Google embeds YouTube videos**, this platform links to and streams from legal sources.

## 🔒 Privacy

- No user tracking
- No data collection
- No cookies (except essential)
- No analytics (optional)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Credits

- Music sources: YouTube, SoundCloud, Jamendo, FMA
- Design inspiration: Spotify
- Built with Next.js and React

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues first

## 🎯 Roadmap

- [ ] Add more music sources (Bandcamp, Archive.org)
- [ ] Lyrics integration
- [ ] Social features (share playlists)
- [ ] Download capability (where allowed)
- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Advanced search filters
- [ ] Recommendations engine

---

**Enjoy unlimited free music! 🎵**
# 🎵 Setup Guide - Free Music Streaming Platform

## Quick Start (No API Keys Required)

The platform works out of the box with mock data. To get real music streaming:

## Step 1: Get API Keys

### YouTube Data API v3 (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name it "Music Streaming Platform"
   - Click "Create"

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key
   - (Optional) Restrict the key to YouTube Data API v3

5. **Add to .env file**
   ```
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### SoundCloud API (Optional)

1. **Go to SoundCloud Developers**
   - Visit: https://soundcloud.com/you/apps

2. **Register Your App**
   - Click "Register a new app"
   - Fill in app details:
     - App name: "Music Streaming Platform"
     - Description: "Free music streaming"
     - Website: Your deployment URL

3. **Get Client ID**
   - After registration, copy your Client ID

4. **Add to .env file**
   ```
   SOUNDCLOUD_CLIENT_ID=your_client_id_here
   ```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use any text editor
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Test the Platform

1. **Search for a song**
   - Try: "Imagine Dragons", "Taylor Swift", etc.

2. **Play music**
   - Click the Play button on any track

3. **Create playlists**
   - Add tracks to your playlist
   - Play from playlist

## Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     - `YOUTUBE_API_KEY`
     - `SOUNDCLOUD_CLIENT_ID`

4. **Deploy**
   - Click "Deploy"
   - Your site will be live in ~2 minutes

## Advanced Configuration

### Enable Real YouTube Streaming

To enable actual YouTube audio streaming, you need to implement one of these:

#### Option 1: Using yt-dlp (Recommended)

```bash
# Install yt-dlp
pip install yt-dlp

# Or use Docker
docker pull ghcr.io/yt-dlp/yt-dlp
```

Update `app/api/stream/route.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getYouTubeStream(videoId: string): Promise<string> {
  const { stdout } = await execAsync(
    `yt-dlp -f bestaudio -g https://www.youtube.com/watch?v=${videoId}`
  );
  return stdout.trim();
}
```

#### Option 2: Using Invidious API

```typescript
async function getYouTubeStream(videoId: string): Promise<string> {
  const response = await fetch(
    `https://invidious.io/api/v1/videos/${videoId}`
  );
  const data = await response.json();
  const audioFormat = data.adaptiveFormats.find(
    (f: any) => f.type.includes('audio')
  );
  return audioFormat.url;
}
```

### Enable Real SoundCloud Streaming

Update `app/api/stream/route.ts`:

```typescript
async function getSoundCloudStream(trackId: string): Promise<string> {
  const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
  
  // Get track info
  const trackResponse = await fetch(
    `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${CLIENT_ID}`
  );
  const track = await trackResponse.json();
  
  // Get stream URL
  const streamResponse = await fetch(
    `${track.media.transcodings[0].url}?client_id=${CLIENT_ID}`
  );
  const streamData = await streamResponse.json();
  
  return streamData.url;
}
```

## Troubleshooting

### API Key Issues

**Error: "API key not valid"**
- Check if API key is correctly added to .env
- Verify API is enabled in Google Cloud Console
- Check for any restrictions on the API key

**Error: "Quota exceeded"**
- YouTube API has daily quota limits
- Free tier: 10,000 units/day
- Each search costs ~100 units
- Consider implementing caching

### Streaming Issues

**Audio not playing**
- Check browser console for errors
- Verify CORS settings
- Test with different browsers
- Check if stream URL is valid

### Deployment Issues

**Build fails on Vercel**
- Check Node.js version (use 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

## Performance Optimization

### Caching

Implement Redis caching for search results:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function searchWithCache(query: string) {
  const cached = await redis.get(`search:${query}`);
  if (cached) return JSON.parse(cached);
  
  const results = await performSearch(query);
  await redis.setex(`search:${query}`, 3600, JSON.stringify(results));
  
  return results;
}
```

### CDN

Use Vercel's Edge Network for faster global access.

## Security Best Practices

1. **Never commit .env file**
2. **Rotate API keys regularly**
3. **Implement rate limiting**
4. **Use environment variables for all secrets**
5. **Enable HTTPS only**

## Support

Need help? Check:
- GitHub Issues
- README.md
- API documentation

---

**Happy streaming! 🎵**
# Troubleshooting Guide

## Search Not Working

### No results when searching
**Solutions:**
1. Check browser console (F12) for errors
2. Try simple search terms: "Beatles", "Taylor Swift"
3. If using YouTube API key, verify it's correct in .env
4. Without API key, app uses Invidious (may take 5-10 seconds)

### "Search failed" error
**Solutions:**
1. Restart dev server: `npm run dev`
2. Check internet connection
3. Try different search term
4. Check console logs for specific error

---

## Playback Not Working

### Songs don't play when clicked
**Solutions:**
1. **Click play button twice** - First click loads player, second starts playback (browser autoplay restriction)
2. Disable ad blockers (uBlock, AdBlock) for localhost
3. Check browser sound permissions
4. Try Chrome/Edge (best compatibility)
5. Unmute browser tab and check volume slider

### Player shows but no sound
**Solutions:**
1. Check volume slider (bottom right of player)
2. Unmute browser tab
3. Check system volume
4. Click "Open in YouTube" button to test directly

---

## API Configuration

### YouTube API Key Not Working
**Check:**
1. API key starts with `AIza`
2. YouTube Data API v3 enabled in Google Cloud Console
3. Quota not exceeded (10,000 units/day, resets midnight PT)
4. .env file in project root (not in app/ folder)

### Environment Variables Not Loading
**Solutions:**
1. Restart dev server after changing .env
2. Verify .env syntax (no quotes, no spaces):
   ```
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## Development Issues

### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

---

## Quick Diagnostics

```bash
# Check Node version (need 18+)
node --version

# Check if .env exists
ls -la .env

# Test API endpoint
curl "http://localhost:3000/api/search?q=test"

# Check for errors
npm run dev
```

---

## Working Configuration

```bash
Node.js: v18.17.0+
Browser: Chrome 120+ or Edge 120+

# Optional .env
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Commands
npm install
npm run dev
# Open http://localhost:3000
```

**Expected behavior:**
- Search returns results in 2-10 seconds
- Click play loads YouTube embed
- Second click starts playback
- Volume control works
- Queue and playlists function properly
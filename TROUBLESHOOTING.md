# Troubleshooting Guide

## Search Not Working

### Symptom: No results when searching
**Causes:**
1. YouTube API quota exceeded (10,000 requests/day limit)
2. Invidious instances down
3. Network/firewall blocking requests

**Solutions:**
1. **Check API Key** (if using one):
   ```bash
   # Verify .env file exists
   cat .env
   # Should show: YOUTUBE_API_KEY=AIza...
   ```

2. **Test without API key**:
   ```bash
   # Remove or comment out API key
   # YOUTUBE_API_KEY=
   npm run dev
   ```
   App will use Invidious fallback automatically.

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

4. **Try different search terms**:
   - Use simple queries: "Beatles", "Taylor Swift"
   - Avoid special characters

### Symptom: "Search failed" error message
**Solution:** Merge PR #3 which updates Invidious instances and adds better error handling.

---

## Playback Not Working

### Symptom: Songs don't play when clicked
**Causes:**
1. Browser autoplay policy blocking
2. YouTube embed restrictions
3. Ad blockers interfering

**Solutions:**

1. **Click play button twice**:
   - First click loads the player
   - Second click starts playback
   - This is due to browser autoplay restrictions

2. **Disable ad blockers**:
   - uBlock Origin, AdBlock may block YouTube embeds
   - Whitelist localhost:3000

3. **Check browser permissions**:
   - Chrome: Settings → Privacy → Site Settings → Sound
   - Allow sound for localhost

4. **Try different browser**:
   - Chrome/Edge work best
   - Firefox may have stricter policies
   - Safari has known issues with autoplay

5. **Check console for errors**:
   ```
   Failed to execute 'postMessage' on 'DOMWindow'
   → YouTube iframe not loaded properly
   
   Uncaught (in promise) DOMException: play() failed
   → Autoplay blocked, click play again
   ```

### Symptom: Player shows but no sound
**Solutions:**
1. Check volume slider (bottom right)
2. Unmute browser tab
3. Check system volume
4. Try opening song in YouTube directly (button provided)

---

## API Configuration Issues

### YouTube API Key Not Working
**Check:**
1. API key is correct (starts with `AIza`)
2. YouTube Data API v3 is enabled in Google Cloud Console
3. No billing issues (free tier should work)
4. Quota not exceeded (check Google Cloud Console)

**Reset quota:**
- Quota resets daily at midnight Pacific Time
- Free tier: 10,000 units/day
- Each search = ~100 units

### Environment Variables Not Loading
**Solutions:**
1. Restart dev server after changing .env:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. Verify .env file location:
   ```bash
   ls -la .env
   # Should be in project root, not in app/ folder
   ```

3. Check .env syntax:
   ```bash
   # Correct:
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   
   # Wrong (no quotes, no spaces):
   YOUTUBE_API_KEY = "AIza..."
   ```

---

## Network/CORS Issues

### Symptom: CORS errors in console
**Causes:**
- Invidious instances blocking requests
- Browser security policies

**Solutions:**
1. Use YouTube API key (no CORS issues)
2. Try different Invidious instance (PR #3 updates list)
3. Run in production mode (CORS less strict)

### Symptom: Requests timing out
**Solutions:**
1. Check internet connection
2. Try different network (mobile hotspot)
3. Disable VPN/proxy
4. Check firewall settings

---

## Performance Issues

### Symptom: Slow search results
**Causes:**
- Invidious instances slow/overloaded
- Network latency

**Solutions:**
1. Use YouTube API key (faster, more reliable)
2. Wait for PR #3 (updated instances)
3. Reduce search results (edit maxResults in code)

### Symptom: Player lagging/buffering
**Causes:**
- Slow internet connection
- YouTube server issues

**Solutions:**
1. Check internet speed (need 3+ Mbps)
2. Close other tabs/apps
3. Try lower quality (YouTube auto-adjusts)

---

## Development Issues

### Symptom: npm install fails
**Solutions:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Try different Node version
nvm use 18
npm install
```

### Symptom: TypeScript errors
**Solutions:**
```bash
# Reinstall types
npm install --save-dev @types/node @types/react typescript

# Check tsconfig.json exists
cat tsconfig.json
```

### Symptom: Port 3000 already in use
**Solutions:**
```bash
# Kill process on port 3000
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

Run these commands to check your setup:

```bash
# 1. Check Node version (need 18+)
node --version

# 2. Check if .env exists
ls -la .env

# 3. Check if dependencies installed
ls node_modules | wc -l
# Should show 100+ packages

# 4. Test API endpoint directly
curl "http://localhost:3000/api/search?q=test"
# Should return JSON with tracks

# 5. Check for errors
npm run dev
# Look for any red error messages
```

---

## Still Having Issues?

1. **Check existing issues**: https://github.com/Akshay-kumar02/free-music-streaming-platform/issues
2. **Create new issue** with:
   - Browser and version
   - Node.js version
   - Error messages from console
   - Steps to reproduce
3. **Merge PR #3** for latest fixes

---

## Working Configuration (Tested)

```bash
# System
Node.js: v18.17.0 or higher
npm: 9.6.7 or higher
Browser: Chrome 120+ or Edge 120+

# .env (optional)
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Commands
npm install
npm run dev
# Open http://localhost:3000
```

**Expected behavior:**
- Search returns results in 2-5 seconds
- Clicking play loads YouTube embed
- Second click starts playback
- Volume control works
- Queue and playlists function properly

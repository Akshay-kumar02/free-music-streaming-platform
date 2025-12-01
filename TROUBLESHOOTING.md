# Troubleshooting Guide

## Search Not Working

### No results when searching
**Solutions:**
1. Check internet connection
2. Try simple search terms: "Beatles", "Taylor Swift", "Adele"
3. iTunes API might be temporarily down (rare)
4. Check browser console (F12) for errors

### "Search failed" error
**Solutions:**
1. Restart dev server: `npm run dev`
2. Check internet connection
3. Try different search term
4. iTunes API is free and doesn't require API key

---

## Playback Issues

### Songs only play for 30 seconds
**This is normal!** iTunes provides 30-second previews only. This is Apple's policy.

**Solutions for full songs:**
- Subscribe to Apple Music
- Add other streaming APIs (Spotify, SoundCloud)
- Use YouTube integration (requires API key)

### Player not starting
**Solutions:**
1. Check browser console for errors
2. Ensure audio isn't muted
3. Try Chrome/Edge (best compatibility)
4. Check browser sound permissions
5. Disable ad blockers for localhost

### No sound
**Solutions:**
1. Check system volume
2. Unmute browser tab
3. Check volume slider in player
4. Try different browser
5. Test with different song

---

## YouTube Integration (Optional)

### YouTube results not showing
**This is normal if you haven't added an API key.**

**To enable YouTube:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Add to `.env` file:
   ```
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Restart dev server

### YouTube API quota exceeded
**Solutions:**
1. Wait 24 hours for quota reset (midnight Pacific Time)
2. Create new Google Cloud project
3. App will still work with iTunes-only results

---

## API Configuration

### Environment Variables Not Loading
**Solutions:**
1. Restart dev server after changing .env
2. Verify .env file location (project root, not in app/ folder)
3. Check .env syntax (no quotes, no spaces):
   ```
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### iTunes API Not Working
**iTunes API requires no configuration!** If it's not working:
1. Check internet connection
2. Try accessing https://itunes.apple.com/search?term=beatles&media=music directly
3. Check if Apple services are down: https://www.apple.com/support/systemstatus/

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

### TypeScript errors
```bash
npm install --save-dev @types/node @types/react typescript
```

---

## Browser Compatibility

### Best Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ⚠️ Safari (may have autoplay restrictions)

### Safari Issues
Safari has strict autoplay policies:
1. User must interact with page first
2. Click play button twice if needed
3. Ensure sound is enabled

---

## Quick Diagnostics

```bash
# Check Node version (need 18+)
node --version

# Check if dependencies installed
ls node_modules | wc -l
# Should show 100+ packages

# Test iTunes API directly
curl "https://itunes.apple.com/search?term=beatles&media=music&limit=5"
# Should return JSON with results

# Test local API endpoint
curl "http://localhost:3000/api/search?q=beatles"
# Should return JSON with tracks

# Check for errors
npm run dev
# Look for any red error messages
```

---

## Common Error Messages

### "Failed to fetch"
- **Cause**: Network issue or CORS
- **Solution**: Check internet, try different network

### "Audio playback failed"
- **Cause**: Browser autoplay policy
- **Solution**: Click play again, ensure user interaction

### "No results found"
- **Cause**: Search term too specific or iTunes API issue
- **Solution**: Try simpler search terms

### "Search failed"
- **Cause**: Network error or API down
- **Solution**: Check internet, try again in a few minutes

---

## Performance Tips

### Slow search results
- iTunes API is usually fast (< 2 seconds)
- Check internet speed
- Try different network
- Clear browser cache

### Player lagging
- Close other tabs/apps
- Check system resources
- Try different browser
- Reduce volume quality (browser setting)

---

## Standalone Demo

Want to test without Next.js?

1. Open `examples/demo.html` in browser
2. No build step needed
3. Works offline (after first load)
4. Pure HTML/CSS/JavaScript

```bash
# Serve demo locally
cd examples
python -m http.server 8000
# Open http://localhost:8000/demo.html
```

---

## Still Having Issues?

1. **Check existing issues**: https://github.com/Akshay-kumar02/free-music-streaming-platform/issues
2. **Create new issue** with:
   - Browser and version
   - Node.js version
   - Error messages from console
   - Steps to reproduce
3. **Test standalone demo** (`examples/demo.html`) to isolate issue

---

## Working Configuration (Tested)

```bash
# System
Node.js: v18.17.0+
npm: 9.6.7+
Browser: Chrome 120+ or Edge 120+

# No .env needed for iTunes-only!
# Optional for YouTube:
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Commands
npm install
npm run dev
# Open http://localhost:3000
```

**Expected behavior:**
- Search returns iTunes results in 1-3 seconds
- Click play starts 30-second preview
- Volume control works
- Queue and playlists function properly
- YouTube results appear if API key provided

---

## API Limits

### iTunes Search API
- ✅ **No API key required**
- ✅ **No rate limits** (reasonable use)
- ✅ **Free forever**
- ⚠️ **30-second previews only**

### YouTube Data API v3 (Optional)
- ⚠️ **Requires API key**
- ⚠️ **10,000 units/day free**
- ⚠️ **Each search = ~100 units**
- ⚠️ **~100 searches/day free**
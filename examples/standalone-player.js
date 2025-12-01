/**
 * Standalone Music Player with iTunes Search API + YouTube (optional)
 * 
 * NO PLACEHOLDER APIs - Uses real working APIs:
 * - iTunes Search API (no key needed)
 * - YouTube Data API v3 (optional, requires key)
 * 
 * Complete working code for:
 * - searchSongs(query)
 * - displaySearchResults(data)
 * - playSong(url)
 */

// Configuration
const YOUTUBE_API_KEY = 'MY_YT_KEY_HERE'; // Replace with your actual key or leave as is for iTunes-only

// Global state
let currentAudio = null;
let searchResults = [];

/**
 * Search for songs using iTunes Search API (primary) and YouTube (optional)
 * @param {string} query - Search term (song name, artist, album)
 * @returns {Promise<Array>} Array of track objects
 */
async function searchSongs(query) {
  if (!query || query.trim() === '') {
    console.error('Search query is empty');
    return [];
  }

  console.log(`Searching for: "${query}"`);
  
  try {
    // Primary: iTunes Search API (no API key needed!)
    const itunesResults = await searchITunes(query);
    console.log(`iTunes: Found ${itunesResults.length} results`);
    
    // Optional: YouTube search if API key is provided
    let youtubeResults = [];
    if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'MY_YT_KEY_HERE') {
      try {
        youtubeResults = await searchYouTube(query);
        console.log(`YouTube: Found ${youtubeResults.length} results`);
      } catch (error) {
        console.warn('YouTube search failed, using iTunes only:', error.message);
      }
    }
    
    // Combine results: iTunes first (has playable audio), then YouTube
    const combinedResults = [...itunesResults, ...youtubeResults];
    searchResults = combinedResults;
    
    console.log(`Total results: ${combinedResults.length}`);
    return combinedResults;
    
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

/**
 * Search iTunes for music tracks
 * @param {string} query - Search term
 * @returns {Promise<Array>} Array of iTunes track objects
 */
async function searchITunes(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`iTunes API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    // Transform iTunes data to our format
    return data.results
      .filter(item => item.previewUrl) // Only include tracks with preview
      .map(item => ({
        id: `itunes-${item.trackId}`,
        trackName: item.trackName,
        artistName: item.artistName,
        albumName: item.collectionName,
        artworkUrl100: item.artworkUrl100.replace('100x100', '300x300'), // Higher quality
        previewUrl: item.previewUrl, // 30-second audio preview
        duration: formatMilliseconds(item.trackTimeMillis),
        genre: item.primaryGenreName,
        releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
        source: 'itunes',
        url: item.trackViewUrl
      }));
      
  } catch (error) {
    console.error('iTunes search error:', error);
    throw error;
  }
}

/**
 * Search YouTube for music videos (requires API key)
 * @param {string} query - Search term
 * @returns {Promise<Array>} Array of YouTube video objects
 */
async function searchYouTube(query) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`YouTube API failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Get video details for duration
    const videoIds = data.items.map(item => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    const durationMap = new Map();
    if (detailsData.items) {
      detailsData.items.forEach(item => {
        durationMap.set(item.id, parseYouTubeDuration(item.contentDetails.duration));
      });
    }
    
    // Transform YouTube data to our format
    return data.items.map(item => ({
      id: `youtube-${item.id.videoId}`,
      trackName: item.snippet.title,
      artistName: item.snippet.channelTitle,
      artworkUrl100: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      previewUrl: null, // YouTube doesn't provide direct audio URLs
      videoId: item.id.videoId,
      duration: durationMap.get(item.id.videoId) || 'N/A',
      source: 'youtube',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
    
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
}

/**
 * Display search results in the DOM
 * @param {Array} tracks - Array of track objects from searchSongs()
 */
function displaySearchResults(tracks) {
  const container = document.getElementById('results-container');
  
  if (!container) {
    console.error('Results container not found. Create a div with id="results-container"');
    return;
  }
  
  // Clear previous results
  container.innerHTML = '';
  
  if (!tracks || tracks.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888;">No results found. Try a different search term.</p>';
    return;
  }
  
  // Create result cards
  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #282828;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    
    card.innerHTML = `
      <img src="${track.artworkUrl100}" alt="${track.trackName}" 
           style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 500; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${track.trackName}
        </div>
        <div style="color: #b3b3b3; font-size: 0.85rem;">
          ${track.artistName}
        </div>
        ${track.albumName ? `<div style="color: #888; font-size: 0.75rem;">${track.albumName}</div>` : ''}
        <div style="color: #1db954; font-size: 0.75rem; margin-top: 4px;">
          ${track.source.toUpperCase()} • ${track.duration}
          ${track.genre ? ` • ${track.genre}` : ''}
        </div>
      </div>
      <button onclick="playSong('${track.previewUrl || track.url}', '${track.source}')" 
              style="padding: 10px 20px; background: #1db954; border: none; border-radius: 20px; 
                     color: white; font-weight: 600; cursor: pointer;">
        ▶ Play
      </button>
    `;
    
    // Hover effect
    card.addEventListener('mouseenter', () => card.style.background = '#3e3e3e');
    card.addEventListener('mouseleave', () => card.style.background = '#282828');
    
    container.appendChild(card);
  });
}

/**
 * Play a song using HTML5 audio element
 * @param {string} url - Audio URL (iTunes previewUrl or YouTube URL)
 * @param {string} source - Source type ('itunes' or 'youtube')
 */
function playSong(url, source = 'itunes') {
  console.log(`Playing: ${url} (${source})`);
  
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  if (source === 'itunes') {
    // Play iTunes preview using HTML5 audio
    currentAudio = new Audio(url);
    currentAudio.volume = 0.7; // 70% volume
    
    currentAudio.play()
      .then(() => {
        console.log('Playback started');
        updateNowPlaying(url);
      })
      .catch(error => {
        console.error('Playback failed:', error);
        alert('Playback failed. Please try again or check your browser settings.');
      });
    
    // Handle playback end
    currentAudio.addEventListener('ended', () => {
      console.log('Playback ended (30-second preview)');
      updateNowPlaying(null);
    });
    
    // Handle errors
    currentAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      alert('Audio playback error. The preview might not be available.');
    });
    
  } else if (source === 'youtube') {
    // For YouTube, open in new tab (or implement YouTube IFrame API)
    console.log('Opening YouTube video in new tab');
    window.open(url, '_blank');
  }
}

/**
 * Update now playing display
 * @param {string|null} url - Current playing URL or null to clear
 */
function updateNowPlaying(url) {
  const nowPlaying = document.getElementById('now-playing');
  
  if (!nowPlaying) return;
  
  if (url) {
    const track = searchResults.find(t => t.previewUrl === url || t.url === url);
    if (track) {
      nowPlaying.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #181818; border-radius: 8px;">
          <img src="${track.artworkUrl100}" alt="${track.trackName}" 
               style="width: 50px; height: 50px; border-radius: 4px;">
          <div>
            <div style="font-weight: 500;">${track.trackName}</div>
            <div style="color: #b3b3b3; font-size: 0.85rem;">${track.artistName}</div>
          </div>
          <button onclick="stopPlayback()" 
                  style="padding: 8px 16px; background: #535353; border: none; border-radius: 20px; 
                         color: white; cursor: pointer; margin-left: auto;">
            ⏸ Stop
          </button>
        </div>
      `;
    }
  } else {
    nowPlaying.innerHTML = '<p style="text-align: center; color: #888;">No song playing</p>';
  }
}

/**
 * Stop current playback
 */
function stopPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    updateNowPlaying(null);
    console.log('Playback stopped');
  }
}

/**
 * Format milliseconds to MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time
 */
function formatMilliseconds(ms) {
  if (!ms) return 'N/A';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse YouTube ISO 8601 duration (PT4M13S -> 4:13)
 * @param {string} duration - ISO 8601 duration string
 * @returns {string} Formatted duration
 */
function parseYouTubeDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Example usage:
/*
<!DOCTYPE html>
<html>
<head>
  <title>Music Player</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #121212;
      color: white;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    #search-container {
      margin-bottom: 30px;
    }
    #search-input {
      width: 70%;
      padding: 12px 20px;
      background: #282828;
      border: 2px solid #333;
      border-radius: 25px;
      color: white;
      font-size: 1rem;
    }
    #search-button {
      padding: 12px 30px;
      background: #1db954;
      border: none;
      border-radius: 25px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <h1>🎵 Music Player</h1>
  
  <div id="search-container">
    <input type="text" id="search-input" placeholder="Search for songs, artists, albums...">
    <button id="search-button" onclick="handleSearch()">🔍 Search</button>
  </div>
  
  <div id="now-playing">
    <p style="text-align: center; color: #888;">No song playing</p>
  </div>
  
  <div id="results-container"></div>
  
  <script src="standalone-player.js"></script>
  <script>
    // Handle search button click
    async function handleSearch() {
      const input = document.getElementById('search-input');
      const query = input.value.trim();
      
      if (!query) {
        alert('Please enter a search term');
        return;
      }
      
      try {
        const results = await searchSongs(query);
        displaySearchResults(results);
      } catch (error) {
        alert('Search failed: ' + error.message);
      }
    }
    
    // Handle Enter key in search input
    document.getElementById('search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  </script>
</body>
</html>
*/

// Export functions for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchSongs,
    displaySearchResults,
    playSong,
    stopPlayback
  };
}
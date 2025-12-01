import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    // Primary: iTunes Search API (no API key needed, 30-second previews)
    const itunesResults = await searchITunes(query);
    
    // Optional: YouTube search if API key is provided
    const API_KEY = process.env.YOUTUBE_API_KEY;
    let youtubeResults: any[] = [];
    
    if (API_KEY && API_KEY !== 'MY_YT_KEY_HERE') {
      try {
        youtubeResults = await searchYouTubeAPI(query, API_KEY);
      } catch (error) {
        console.error('YouTube search failed, using iTunes only:', error);
      }
    }
    
    // Combine results: iTunes first (has playable audio), then YouTube
    const combinedResults = [...itunesResults, ...youtubeResults];
    
    return NextResponse.json({ 
      tracks: combinedResults,
      sources: {
        itunes: itunesResults.length,
        youtube: youtubeResults.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      tracks: [], 
      error: 'Search failed. Please try again.' 
    });
  }
}

// iTunes Search API - Real music with 30-second previews
async function searchITunes(query: string) {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`,
      { 
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`iTunes API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('No iTunes results found');
      return [];
    }
    
    console.log(`iTunes: Found ${data.results.length} results`);
    
    return data.results
      .filter((item: any) => item.previewUrl) // Only include tracks with preview
      .map((item: any) => ({
        id: `itunes-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        duration: formatMilliseconds(item.trackTimeMillis),
        thumbnail: item.artworkUrl100.replace('100x100', '300x300'), // Higher quality
        source: 'itunes',
        url: item.trackViewUrl,
        previewUrl: item.previewUrl, // 30-second audio preview
        releaseDate: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
        genre: item.primaryGenreName
      }));
  } catch (error) {
    console.error('iTunes search error:', error);
    throw error;
  }
}

// YouTube Data API v3 (optional, requires API key)
async function searchYouTubeAPI(query: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('YouTube API error:', errorData);
      throw new Error(`YouTube API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Get video details for duration
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    const detailsData = await detailsResponse.json();
    const durationMap = new Map();
    
    if (detailsData.items) {
      detailsData.items.forEach((item: any) => {
        durationMap.set(item.id, parseDuration(item.contentDetails.duration));
      });
    }
    
    console.log(`YouTube: Found ${data.items.length} results`);
    
    return data.items.map((item: any) => ({
      id: `youtube-${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      duration: durationMap.get(item.id.videoId) || 'N/A',
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      source: 'youtube',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      videoId: item.id.videoId
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
}

// Format milliseconds to MM:SS
function formatMilliseconds(ms: number): string {
  if (!ms) return 'N/A';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Parse ISO 8601 duration (PT4M13S -> 4:13)
function parseDuration(duration: string): string {
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
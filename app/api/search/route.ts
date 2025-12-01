import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (API_KEY) {
      // Use official YouTube Data API
      const youtubeResults = await searchYouTubeAPI(query, API_KEY);
      return NextResponse.json({ tracks: youtubeResults });
    } else {
      // Fallback: Use Invidious (public YouTube API alternative)
      const invidiousResults = await searchInvidious(query);
      return NextResponse.json({ tracks: invidiousResults });
    }
  } catch (error) {
    console.error('Search error:', error);
    // Final fallback
    try {
      const invidiousResults = await searchInvidious(query);
      return NextResponse.json({ tracks: invidiousResults });
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      return NextResponse.json({ tracks: [], error: 'Search failed' });
    }
  }
}

// Official YouTube Data API v3
async function searchYouTubeAPI(query: string, apiKey: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&videoCategoryId=10&maxResults=20&key=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error('YouTube API request failed');
  }
  
  const data = await response.json();
  
  // Get video details for duration
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
  );
  
  const detailsData = await detailsResponse.json();
  const durationMap = new Map();
  
  detailsData.items.forEach((item: any) => {
    durationMap.set(item.id, parseDuration(item.contentDetails.duration));
  });
  
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    duration: durationMap.get(item.id.videoId) || 'N/A',
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
    source: 'youtube',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));
}

// Invidious API (public YouTube frontend - no API key needed)
async function searchInvidious(query: string) {
  // Try multiple Invidious instances for reliability
  const instances = [
    'https://invidious.io',
    'https://inv.riverside.rocks',
    'https://invidious.snopyta.org',
    'https://yewtu.be'
  ];
  
  for (const instance of instances) {
    try {
      const response = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query + ' official audio')}&type=video&sort_by=relevance`,
        { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) continue;
      
      return data.slice(0, 20).map((item: any) => ({
        id: item.videoId,
        title: item.title,
        artist: item.author,
        duration: formatSeconds(item.lengthSeconds),
        thumbnail: item.videoThumbnails?.[2]?.url || item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
        source: 'youtube',
        url: `https://www.youtube.com/watch?v=${item.videoId}`
      }));
    } catch (error) {
      console.error(`Failed to fetch from ${instance}:`, error);
      continue;
    }
  }
  
  throw new Error('All Invidious instances failed');
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

// Format seconds to MM:SS
function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
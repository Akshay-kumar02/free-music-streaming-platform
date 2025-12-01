import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const title = searchParams.get('title');

  if (!videoId && !title) {
    return NextResponse.json({ recommendations: [] });
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (API_KEY && videoId) {
      // Use YouTube's related videos API
      const recommendations = await getYouTubeRelated(videoId, API_KEY);
      return NextResponse.json({ recommendations });
    } else {
      // Fallback: Use Invidious or search-based recommendations
      const recommendations = await getInvidiousRelated(videoId, title);
      return NextResponse.json({ recommendations });
    }
  } catch (error) {
    console.error('Recommendations error:', error);
    // Fallback to search-based recommendations
    if (title) {
      try {
        const searchBased = await getSearchBasedRecommendations(title);
        return NextResponse.json({ recommendations: searchBased });
      } catch (fallbackError) {
        return NextResponse.json({ recommendations: [] });
      }
    }
    return NextResponse.json({ recommendations: [] });
  }
}

// YouTube Data API - Related Videos
async function getYouTubeRelated(videoId: string, apiKey: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`
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

// Invidious API - Related Videos
async function getInvidiousRelated(videoId: string | null, title: string | null) {
  const instances = [
    'https://invidious.io',
    'https://inv.riverside.rocks',
    'https://yewtu.be'
  ];
  
  for (const instance of instances) {
    try {
      let url = '';
      
      if (videoId) {
        // Get related videos by video ID
        url = `${instance}/api/v1/videos/${videoId}`;
      } else if (title) {
        // Search for similar songs
        const artist = extractArtist(title);
        const searchQuery = artist || title.split('-')[0].trim();
        url = `${instance}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video&sort_by=relevance`;
      }
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      let recommendations = [];
      
      if (videoId && data.recommendedVideos) {
        recommendations = data.recommendedVideos.slice(0, 10).map((item: any) => ({
          id: item.videoId,
          title: item.title,
          artist: item.author,
          duration: formatSeconds(item.lengthSeconds),
          thumbnail: `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
          source: 'youtube',
          url: `https://www.youtube.com/watch?v=${item.videoId}`
        }));
      } else if (Array.isArray(data)) {
        recommendations = data.slice(0, 10).map((item: any) => ({
          id: item.videoId,
          title: item.title,
          artist: item.author,
          duration: formatSeconds(item.lengthSeconds),
          thumbnail: item.videoThumbnails?.[2]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
          source: 'youtube',
          url: `https://www.youtube.com/watch?v=${item.videoId}`
        }));
      }
      
      if (recommendations.length > 0) {
        return recommendations;
      }
    } catch (error) {
      console.error(`Failed to fetch from ${instance}:`, error);
      continue;
    }
  }
  
  throw new Error('All recommendation sources failed');
}

// Search-based recommendations (extract artist and search)
async function getSearchBasedRecommendations(title: string) {
  const artist = extractArtist(title);
  const searchQuery = artist || title.split('-')[0].trim();
  
  const instances = ['https://invidious.io', 'https://yewtu.be'];
  
  for (const instance of instances) {
    try {
      const response = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video&sort_by=relevance`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 10).map((item: any) => ({
          id: item.videoId,
          title: item.title,
          artist: item.author,
          duration: formatSeconds(item.lengthSeconds),
          thumbnail: item.videoThumbnails?.[2]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
          source: 'youtube',
          url: `https://www.youtube.com/watch?v=${item.videoId}`
        }));
      }
    } catch (error) {
      continue;
    }
  }
  
  return [];
}

// Extract artist name from title
function extractArtist(title: string): string {
  // Common patterns: "Artist - Song", "Artist: Song", "Song by Artist"
  const patterns = [
    /^([^-]+)\s*-/,  // "Artist - Song"
    /^([^:]+)\s*:/,  // "Artist: Song"
    /by\s+([^(]+)/i  // "Song by Artist"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return '';
}

// Parse ISO 8601 duration
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
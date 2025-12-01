import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    // Search across multiple free sources
    const [youtubeResults, soundcloudResults] = await Promise.all([
      searchYouTube(query),
      searchSoundCloud(query),
    ]);

    const tracks = [...youtubeResults, ...soundcloudResults];

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ tracks: [] });
  }
}

async function searchYouTube(query: string) {
  // Using YouTube search via public APIs
  // In production, use YouTube Data API v3 with API key
  
  // Mock data for demonstration - replace with actual YouTube API
  const mockResults = [
    {
      id: `yt-${Date.now()}-1`,
      title: `${query} - Official Audio`,
      artist: 'Various Artists',
      duration: '3:45',
      thumbnail: 'https://via.placeholder.com/60x60/ff0000/ffffff?text=YT',
      source: 'youtube',
      url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
    },
    {
      id: `yt-${Date.now()}-2`,
      title: `${query} (Official Music Video)`,
      artist: 'Top Artists',
      duration: '4:12',
      thumbnail: 'https://via.placeholder.com/60x60/ff0000/ffffff?text=YT',
      source: 'youtube',
      url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
    },
    {
      id: `yt-${Date.now()}-3`,
      title: `${query} - Live Performance`,
      artist: 'Live Sessions',
      duration: '5:30',
      thumbnail: 'https://via.placeholder.com/60x60/ff0000/ffffff?text=YT',
      source: 'youtube',
      url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
    }
  ];

  return mockResults;
}

async function searchSoundCloud(query: string) {
  // Using SoundCloud API
  // In production, use SoundCloud API with client ID
  
  // Mock data for demonstration - replace with actual SoundCloud API
  const mockResults = [
    {
      id: `sc-${Date.now()}-1`,
      title: `${query} (SoundCloud Exclusive)`,
      artist: 'Independent Artists',
      duration: '3:20',
      thumbnail: 'https://via.placeholder.com/60x60/ff5500/ffffff?text=SC',
      source: 'soundcloud',
      url: `https://soundcloud.com/search?q=${encodeURIComponent(query)}`
    },
    {
      id: `sc-${Date.now()}-2`,
      title: `${query} - Remix`,
      artist: 'DJ Mix',
      duration: '4:45',
      thumbnail: 'https://via.placeholder.com/60x60/ff5500/ffffff?text=SC',
      source: 'soundcloud',
      url: `https://soundcloud.com/search?q=${encodeURIComponent(query)}`
    }
  ];

  return mockResults;
}

// To implement real YouTube search:
// 1. Get YouTube Data API key from https://console.cloud.google.com
// 2. Use this code:
/*
async function searchYouTube(query: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&key=${API_KEY}`
  );
  const data = await response.json();
  
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    duration: 'N/A', // Get from video details API
    thumbnail: item.snippet.thumbnails.default.url,
    source: 'youtube',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));
}
*/

// To implement real SoundCloud search:
// 1. Get SoundCloud API client ID
// 2. Use this code:
/*
async function searchSoundCloud(query: string) {
  const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
  const response = await fetch(
    `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&client_id=${CLIENT_ID}&limit=10`
  );
  const data = await response.json();
  
  return data.map((track: any) => ({
    id: track.id.toString(),
    title: track.title,
    artist: track.user.username,
    duration: formatDuration(track.duration),
    thumbnail: track.artwork_url || track.user.avatar_url,
    source: 'soundcloud',
    url: track.permalink_url
  }));
}
*/
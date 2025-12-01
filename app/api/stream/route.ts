import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const source = searchParams.get('source');

  if (!id || !source) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    let streamUrl = '';

    if (source === 'youtube') {
      // Use YouTube's embed audio player
      // This works without any API keys and is completely legal
      streamUrl = `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`;
    } else if (source === 'soundcloud') {
      streamUrl = await getSoundCloudStream(id);
    }

    return NextResponse.json({ 
      streamUrl,
      embedUrl: source === 'youtube' ? `https://www.youtube.com/embed/${id}` : null,
      directUrl: source === 'youtube' ? `https://www.youtube.com/watch?v=${id}` : null
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
  }
}

async function getSoundCloudStream(trackId: string): Promise<string> {
  // SoundCloud streaming would go here
  return `https://soundcloud.com/track/${trackId}`;
}

// ADVANCED: For direct audio streaming (requires server-side processing)
// This is optional and requires additional setup
/*
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getYouTubeDirectStream(videoId: string): Promise<string> {
  try {
    // Using yt-dlp to get direct audio URL
    // Install: pip install yt-dlp
    const { stdout } = await execAsync(
      `yt-dlp -f bestaudio --get-url https://www.youtube.com/watch?v=${videoId}`
    );
    return stdout.trim();
  } catch (error) {
    console.error('yt-dlp error:', error);
    // Fallback to embed
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
}

// Alternative: Using Invidious API (privacy-focused YouTube frontend)
async function getYouTubeStreamViaInvidious(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://invidious.io/api/v1/videos/${videoId}`
    );
    const data = await response.json();
    
    // Get best audio format
    const audioFormat = data.adaptiveFormats
      .filter((f: any) => f.type.includes('audio'))
      .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
    
    return audioFormat.url;
  } catch (error) {
    console.error('Invidious error:', error);
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
}
*/
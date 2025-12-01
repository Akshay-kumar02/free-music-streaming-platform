import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const source = searchParams.get('source');
  const previewUrl = searchParams.get('previewUrl');

  if (!id || !source) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    let streamUrl = '';
    let embedUrl = null;
    let directUrl = null;

    if (source === 'itunes') {
      // iTunes provides direct MP3 preview URLs (30 seconds)
      streamUrl = previewUrl || '';
      directUrl = previewUrl || '';
    } else if (source === 'youtube') {
      // Extract YouTube video ID from the id field
      const videoId = id.replace('youtube-', '');
      // Use YouTube's embed audio player
      streamUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      directUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    return NextResponse.json({ 
      streamUrl,
      embedUrl,
      directUrl,
      source
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
  }
}
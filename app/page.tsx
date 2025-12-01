'use client';

import { useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  source: string;
  url: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const addToPlaylist = (track: Track) => {
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist([...playlist, track]);
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[prevIndex]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1db954', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>🎵 Free Music Streaming</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Unlimited music, completely free - No ads, no limits</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '20px', padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
        {/* Left Sidebar - Playlist */}
        <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>📝 My Playlist</h2>
          {playlist.length === 0 ? (
            <p style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>No tracks in playlist</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {playlist.map(track => (
                <div key={track.id} style={{ 
                  backgroundColor: currentTrack?.id === track.id ? '#282828' : '#1e1e1e', 
                  padding: '10px', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: currentTrack?.id === track.id ? '2px solid #1db954' : 'none'
                }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => playTrack(track)}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{track.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>{track.artist}</div>
                  </div>
                  <button
                    onClick={() => removeFromPlaylist(track.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b3b3b3',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div>
          {/* Search Bar */}
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for songs, artists, albums..."
                style={{
                  flex: 1,
                  padding: '15px 20px',
                  backgroundColor: '#282828',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '15px 40px',
                  backgroundColor: '#1db954',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px', marginBottom: currentTrack ? '200px' : '20px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
              {tracks.length > 0 ? `🎵 ${tracks.length} Results` : '🎵 Search Results'}
            </h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                Loading tracks...
              </div>
            ) : tracks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                Search for your favorite music
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tracks.map(track => (
                  <div key={track.id} style={{
                    backgroundColor: '#282828',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                  >
                    <img src={track.thumbnail} alt={track.title} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '4px' }}>{track.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#b3b3b3' }}>{track.artist}</div>
                      <div style={{ fontSize: '0.75rem', color: '#1db954', marginTop: '4px' }}>
                        {track.source.toUpperCase()} • {track.duration}
                      </div>
                    </div>
                    <button
                      onClick={() => playTrack(track)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#1db954',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >▶ Play</button>
                    <button
                      onClick={() => addToPlaylist(track)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#535353',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >+ Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Info */}
        <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>ℹ️ About</h2>
          <div style={{ fontSize: '0.9rem', color: '#b3b3b3', lineHeight: '1.6' }}>
            <p><strong style={{ color: 'white' }}>100% Free</strong><br/>No subscription needed</p>
            <p><strong style={{ color: 'white' }}>No Ads</strong><br/>Uninterrupted listening</p>
            <p><strong style={{ color: 'white' }}>Unlimited</strong><br/>Stream as much as you want</p>
            <p><strong style={{ color: 'white' }}>Legal Sources</strong><br/>YouTube & more</p>
          </div>
        </div>
      </div>

      {/* Player Bar */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#181818',
          borderTop: '1px solid #282828',
          padding: '15px 20px',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
            <img src={currentTrack.thumbnail} alt={currentTrack.title} style={{ width: '56px', height: '56px', borderRadius: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{currentTrack.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#b3b3b3' }}>{currentTrack.artist}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button
                onClick={playPrevious}
                disabled={playlist.length === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: playlist.length === 0 ? '#333' : '#535353',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: playlist.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >⏮</button>
              
              <button
                onClick={togglePlay}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1db954',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <button
                onClick={playNext}
                disabled={playlist.length === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: playlist.length === 0 ? '#333' : '#535353',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: playlist.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >⏭</button>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#1db954', fontWeight: '600' }}>
              {currentTrack.source.toUpperCase()}
            </div>
            
            <a 
              href={currentTrack.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                backgroundColor: '#535353',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              Open in YouTube
            </a>
          </div>

          {/* YouTube Player */}
          {isPlaying && currentTrack.source === 'youtube' && (
            <div style={{ marginTop: '10px' }}>
              <iframe
                ref={playerRef}
                width="100%"
                height="80"
                src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1`}
                title={currentTrack.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
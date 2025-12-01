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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const playTrack = async (track: Track) => {
    try {
      const response = await fetch(`/api/stream?id=${track.id}&source=${track.source}`);
      const data = await response.json();
      
      if (data.streamUrl) {
        setCurrentTrack(track);
        if (audioRef.current) {
          audioRef.current.src = data.streamUrl;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const addToPlaylist = (track: Track) => {
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist([...playlist, track]);
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
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
                  backgroundColor: '#282828', 
                  padding: '10px', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
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
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px' }}>
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
            <p><strong style={{ color: 'white' }}>Legal Sources</strong><br/>YouTube, SoundCloud & more</p>
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
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <img src={currentTrack.thumbnail} alt={currentTrack.title} style={{ width: '56px', height: '56px', borderRadius: '4px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{currentTrack.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#b3b3b3' }}>{currentTrack.artist}</div>
          </div>
          
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
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
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '40px' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  outline: 'none',
                  background: `linear-gradient(to right, #1db954 0%, #1db954 ${(currentTime / duration) * 100}%, #4d4d4d ${(currentTime / duration) * 100}%, #4d4d4d 100%)`
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '40px' }}>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div style={{ fontSize: '0.75rem', color: '#1db954', fontWeight: '600' }}>
            {currentTrack.source.toUpperCase()}
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
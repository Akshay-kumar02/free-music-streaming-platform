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

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [volume, setVolume] = useState(100);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'recommendations'>('search');
  
  const playerRef = useRef<HTMLIFrameElement>(null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('playlists');
    if (saved) {
      setPlaylists(JSON.parse(saved));
    }
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setActiveTab('search');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setTracks(data.tracks || []);
      
      if (data.tracks && data.tracks.length === 0) {
        alert('No results found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    }
    setLoading(false);
  };

  const loadRecommendations = async (track: Track) => {
    try {
      const response = await fetch(
        `/api/recommendations?videoId=${track.id}&title=${encodeURIComponent(track.title)}`
      );
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  const playTrack = (track: Track, autoQueue: boolean = true) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Load recommendations for auto-play
    loadRecommendations(track);
    
    // Auto-add to queue if not already there
    if (autoQueue && !queue.find(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const addToQueue = (track: Track) => {
    if (!queue.find(t => t.id === track.id)) {
      setQueue([...queue, track]);
    }
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(queue.filter(t => t.id !== trackId));
  };

  const playNext = () => {
    if (queue.length === 0) {
      // Auto-play from recommendations
      if (recommendations.length > 0) {
        const nextTrack = recommendations[0];
        playTrack(nextTrack);
        setRecommendations(prev => prev.slice(1));
      }
      return;
    }
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex], false);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[prevIndex], false);
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      tracks: []
    };
    
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
  };

  const addToPlaylist = (track: Track, playlistId: string) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        if (!pl.tracks.find(t => t.id === track.id)) {
          return { ...pl, tracks: [...pl.tracks, track] };
        }
      }
      return pl;
    }));
  };

  const removeFromPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
      }
      return pl;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    if (confirm('Delete this playlist?')) {
      setPlaylists(playlists.filter(pl => pl.id !== playlistId));
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    playTrack(playlist.tracks[0], false);
    setCurrentPlaylist(playlist);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: currentTrack ? '180px' : '20px' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1db954', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>🎵 AI Music Player</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Search any song • AI recommendations • Unlimited streaming</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
        {/* Left Sidebar - Playlists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Queue */}
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎧 Queue ({queue.length})</span>
              {queue.length > 0 && (
                <button
                  onClick={() => setQueue([])}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#333',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >Clear</button>
              )}
            </h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {queue.length === 0 ? (
                <p style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>No tracks in queue</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {queue.map((track, index) => (
                    <div key={track.id + index} style={{ 
                      backgroundColor: currentTrack?.id === track.id ? '#282828' : '#1e1e1e', 
                      padding: '8px', 
                      borderRadius: '6px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      border: currentTrack?.id === track.id ? '2px solid #1db954' : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => playTrack(track, false)}
                    >
                      <img src={track.thumbnail} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#b3b3b3' }}>{track.duration}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(track.id); }}
                        style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: '1.2rem' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Playlists */}
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 Playlists</span>
              <button
                onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#1db954',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >+ New</button>
            </h2>
            
            {showCreatePlaylist && (
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                  placeholder="Playlist name..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#282828',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={createPlaylist}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1db954',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >Create</button>
              </div>
            )}
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {playlists.length === 0 ? (
                <p style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>No playlists yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {playlists.map(playlist => (
                    <div key={playlist.id} style={{
                      backgroundColor: currentPlaylist?.id === playlist.id ? '#282828' : '#1e1e1e',
                      padding: '10px',
                      borderRadius: '6px',
                      border: currentPlaylist?.id === playlist.id ? '2px solid #1db954' : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{playlist.name}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => playPlaylist(playlist)}
                            disabled={playlist.tracks.length === 0}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: playlist.tracks.length === 0 ? '#333' : '#1db954',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '0.7rem',
                              cursor: playlist.tracks.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                          >▶</button>
                          <button
                            onClick={() => deletePlaylist(playlist.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#d32f2f',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                          >🗑</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>{playlist.tracks.length} tracks</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                placeholder="Search any song, artist, or album..."
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('search')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'search' ? '#1db954' : '#282828',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >Search Results ({tracks.length})</button>
            <button
              onClick={() => setActiveTab('recommendations')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'recommendations' ? '#1db954' : '#282828',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >Recommendations ({recommendations.length})</button>
          </div>

          {/* Content Area */}
          <div style={{ backgroundColor: '#181818', borderRadius: '8px', padding: '20px' }}>
            {activeTab === 'search' && (
              <>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
                  {tracks.length > 0 ? `🎵 ${tracks.length} Results` : '🎵 Search Results'}
                </h2>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
                    Searching for music...
                  </div>
                ) : tracks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎵</div>
                    Search for any song in the world
                  </div>
                ) : (
                  <TrackList 
                    tracks={tracks} 
                    onPlay={playTrack}
                    onAddToQueue={addToQueue}
                    onAddToPlaylist={addToPlaylist}
                    playlists={playlists}
                    currentTrack={currentTrack}
                  />
                )}
              </>
            )}

            {activeTab === 'recommendations' && (
              <>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
                  ✨ AI Recommendations
                </h2>
                
                {recommendations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤖</div>
                    Play a song to get AI-powered recommendations
                  </div>
                ) : (
                  <TrackList 
                    tracks={recommendations} 
                    onPlay={playTrack}
                    onAddToQueue={addToQueue}
                    onAddToPlaylist={addToPlaylist}
                    playlists={playlists}
                    currentTrack={currentTrack}
                  />
                )}
              </>
            )}
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#b3b3b3' }}>{currentTrack.artist}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button
                onClick={playPrevious}
                disabled={queue.length === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: queue.length === 0 ? '#333' : '#535353',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
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
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#535353',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >⏭</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem' }}>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                style={{ width: '100px' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '35px' }}>{volume}%</span>
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

// Track List Component
function TrackList({ tracks, onPlay, onAddToQueue, onAddToPlaylist, playlists, currentTrack }: any) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {tracks.map((track: Track) => (
        <div key={track.id} style={{
          backgroundColor: '#282828',
          padding: '15px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          transition: 'background-color 0.2s',
          cursor: 'pointer',
          border: currentTrack?.id === track.id ? '2px solid #1db954' : 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#282828'}
        >
          <img src={track.thumbnail} alt={track.title} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#b3b3b3' }}>{track.artist}</div>
            <div style={{ fontSize: '0.75rem', color: '#1db954', marginTop: '4px' }}>
              {track.source.toUpperCase()} • {track.duration}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <button
              onClick={() => onPlay(track)}
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
              onClick={() => onAddToQueue(track)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#535353',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >+ Queue</button>
            <button
              onClick={() => setShowPlaylistMenu(showPlaylistMenu === track.id ? null : track.id)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#535353',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >+ Playlist</button>
            
            {showPlaylistMenu === track.id && playlists.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '5px',
                backgroundColor: '#282828',
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 10,
                minWidth: '150px'
              }}>
                {playlists.map((pl: Playlist) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      onAddToPlaylist(track, pl.id);
                      setShowPlaylistMenu(null);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      backgroundColor: '#1e1e1e',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
                  >
                    {pl.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
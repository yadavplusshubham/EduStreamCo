'use client';

import { useState, useEffect } from 'react';
import { Search, X, Youtube, Loader2, Star, ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import CourseCard from './CourseCard';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchResults = ({ results, query, onClear, onPlay, onAddToList, onOpenModal, myList, onRefreshCourses }) => {
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [isSearchingYoutube, setIsSearchingYoutube] = useState(false);
  const [autoAddedCount, setAutoAddedCount] = useState(0);
  const [autoAddedTitles, setAutoAddedTitles] = useState([]);

  useEffect(() => {
    const searchYoutube = async () => {
      if (query.length < 3) {
        setYoutubeResults([]);
        return;
      }

      setIsSearchingYoutube(true);
      setAutoAddedCount(0);
      setAutoAddedTitles([]);

      try {
        const response = await fetch(`${API}/search/youtube?q=${encodeURIComponent(query)}&max_results=10&auto_add=true`);
        if (response.ok) {
          const data = await response.json();
          setYoutubeResults(data.results || []);
          setAutoAddedCount(data.autoAddedCount || 0);
          setAutoAddedTitles(data.autoAdded || []);

          if (data.autoAddedCount > 0 && onRefreshCourses) {
            onRefreshCourses();
          }
        }
      } catch (err) {
        console.error('YouTube search failed:', err);
      } finally {
        setIsSearchingYoutube(false);
      }
    };

    const debounce = setTimeout(searchYoutube, 500);
    return () => clearTimeout(debounce);
  }, [query, onRefreshCourses]);

  return (
    <div className="pt-24 pb-12 px-4 md:px-12 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6 text-gray-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Search Results for &quot;{query}&quot;
            </h1>
          </div>
          <p className="text-gray-400">
            {results.length} {results.length === 1 ? 'course' : 'courses'} found in your library
          </p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-white text-sm"
        >
          <X className="w-4 h-4" />
          Clear Search
        </button>
      </div>

      {/* Auto-added notification */}
      {autoAddedCount > 0 && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-medium">
              Auto-added {autoAddedCount} course{autoAddedCount > 1 ? 's' : ''} from verified channels!
            </p>
            <p className="text-green-400/70 text-sm mt-1">
              {autoAddedTitles.slice(0, 3).join(', ')}{autoAddedTitles.length > 3 ? '...' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Local Results Grid */}
      {results.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">In Your Library</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map((course) => (
              <div key={course.id} className="flex justify-center">
                <CourseCard
                  course={course}
                  onPlay={onPlay}
                  onAddToList={onAddToList}
                  onOpenModal={onOpenModal}
                  isInList={myList.includes(course.id)}
                  isExpanded
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No local results message */}
      {results.length === 0 && !isSearchingYoutube && youtubeResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 mb-8">
          <Search className="w-12 h-12 text-gray-600 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No courses found</h2>
          <p className="text-gray-400 text-sm">
            Searching YouTube for &quot;{query}&quot;...
          </p>
        </div>
      )}

      {/* YouTube Results Section */}
      {(isSearchingYoutube || youtubeResults.length > 0) && (
        <div className="border-t border-white/10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Youtube className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold text-white">From YouTube</h2>
              {isSearchingYoutube && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-green-400" />
              Verified channels are auto-added
            </p>
          </div>

          {youtubeResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {youtubeResults.map((playlist) => (
                <div
                  key={playlist.playlistId}
                  className={`bg-[#181818] rounded-lg overflow-hidden border transition-all ${
                    playlist.isEducational ? 'border-green-500/30' : 'border-white/10'
                  } hover:border-white/30`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                    {playlist.isEducational && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-600 rounded text-white text-xs font-medium">
                        <Star className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    {playlist.autoAdded && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 rounded text-white text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Auto-added
                      </div>
                    )}
                    {playlist.alreadyAdded && !playlist.autoAdded && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-medium">
                        In Library
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                      {playlist.videoCount} videos
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {playlist.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">
                      {playlist.channelTitle}
                      {playlist.isEducational && (
                        <span className="text-green-400 ml-1">• {playlist.universityName}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2">
                      {playlist.alreadyAdded ? (
                        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded text-sm">
                          <CheckCircle className="w-4 h-4" />
                          {playlist.autoAdded ? 'Auto-added' : 'In Library'}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-400 rounded text-sm">
                          Not from verified channel
                        </div>
                      )}
                      <a
                        href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearchingYoutube && youtubeResults.length === 0 && query.length >= 3 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No playlists found on YouTube for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Maximize,
  SkipBack,
  SkipForward,
  ChevronDown,
  Check,
  List,
  Minimize,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WatchClient = ({ courseId, initialModule }) => {
  const router = useRouter();
  const parsedInitialModule = parseInt(initialModule || '0', 10);

  const [course, setCourse] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(parsedInitialModule);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoRestricted, setVideoRestricted] = useState(false);
  const [restrictedVideos, setRestrictedVideos] = useState(new Set());

  const controlsTimeoutRef = useRef(null);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API}/courses/${courseId}`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (course) {
      const savedProgress = localStorage.getItem('edustream-progress');
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      progress[courseId] = {
        currentVideoIndex: currentModuleIndex,
        watchedVideos: currentModuleIndex + 1,
        totalVideos: course?.modules?.length || 1,
        lastWatched: new Date().toISOString(),
      };
      localStorage.setItem('edustream-progress', JSON.stringify(progress));
    }
  }, [courseId, currentModuleIndex, course]);

  useEffect(() => {
    saveProgress();
  }, [currentModuleIndex, saveProgress]);

  // Check for restricted video
  useEffect(() => {
    if (course) {
      const currentVideoId = course?.modules?.[currentModuleIndex]?.videoId;
      setVideoRestricted(restrictedVideos.has(currentVideoId));
    }
  }, [course, currentModuleIndex, restrictedVideos]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube player for error detection and auto-play next
  useEffect(() => {
    if (!course || videoRestricted) return;

    const currentVideoId = course?.modules?.[currentModuleIndex]?.videoId;
    const hasNext = currentModuleIndex < course.modules.length - 1;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          new window.YT.Player(iframeRef.current, {
            events: {
              onStateChange: (event) => {
                if (event.data === 0 && hasNext) {
                  saveProgress();
                  setVideoRestricted(false);
                  setCurrentModuleIndex(prev => prev + 1);
                }
              },
              onError: (event) => {
                if (event.data === 101 || event.data === 150 || event.data === 5) {
                  setVideoRestricted(true);
                  setRestrictedVideos(prev => new Set([...prev, currentVideoId]));
                }
              },
            },
          });
        } catch (e) {
          console.log('Could not initialize YT player:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      setTimeout(initPlayer, 1000);
    } else {
      window.onYouTubeIframeAPIReady = () => setTimeout(initPlayer, 1000);
    }
  }, [course, currentModuleIndex, videoRestricted, saveProgress]);

  // Listen for YouTube iframe errors via postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onError') {
          const errorCode = data.info;
          if (errorCode === 101 || errorCode === 150 || errorCode === 5) {
            const currentVideoId = course?.modules?.[currentModuleIndex]?.videoId;
            setVideoRestricted(true);
            setRestrictedVideos(prev => new Set([...prev, currentVideoId]));
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [course, currentModuleIndex]);

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showEpisodes) setShowControls(false);
    }, 3000);
  }, [showEpisodes]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            router.push('/');
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey && course && currentModuleIndex < course.modules.length - 1) {
            setCurrentModuleIndex(prev => prev + 1);
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey && currentModuleIndex > 0) {
            setCurrentModuleIndex(prev => prev - 1);
          }
          break;
        case 'f':
          handleFullscreen();
          break;
        default:
          break;
      }
      resetControlsTimeout();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, course, currentModuleIndex, resetControlsTimeout, isFullscreen]);

  const handleMouseMove = () => resetControlsTimeout();

  const handleClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    resetControlsTimeout();
  };

  const handleWatchOnYouTube = (videoId) => {
    saveProgress();
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const goToNextEpisode = () => {
    if (course && currentModuleIndex < course.modules.length - 1) {
      saveProgress();
      setVideoRestricted(false);
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const goToPrevEpisode = () => {
    if (currentModuleIndex > 0) {
      saveProgress();
      setVideoRestricted(false);
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  const selectEpisode = (index) => {
    saveProgress();
    setVideoRestricted(false);
    setCurrentModuleIndex(index);
    setShowEpisodes(false);
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const hasNextEpisode = currentModuleIndex < course.modules.length - 1;
  const hasPrevEpisode = currentModuleIndex > 0;

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${currentModule.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&controls=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  return (
    <div
      ref={playerRef}
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      data-testid="watch-page"
    >
      {/* Click hint */}
      {!showControls && !videoRestricted && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-black/70 px-4 py-2 rounded-full text-white text-sm">
            Click anywhere to show controls
          </div>
        </div>
      )}

      {/* Video Player */}
      {videoRestricted ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-black z-10">
          <div className="text-center max-w-md px-6">
            <div className="absolute inset-0 z-0">
              <img
                src={currentModule.thumbnail || course.thumbnail}
                alt=""
                className="w-full h-full object-cover opacity-20 blur-xl"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Video Restricted</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                The video owner has disabled playback on external websites.
                You can still watch this video directly on YouTube.
              </p>
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-white font-medium text-sm truncate">{currentModule.title}</p>
                <p className="text-gray-500 text-xs mt-1">{currentModule.duration}</p>
              </div>
              <button
                onClick={() => handleWatchOnYouTube(currentModule.videoId)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                data-testid="watch-on-youtube-btn"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
                <ExternalLink className="w-4 h-4" />
              </button>
              {hasNextEpisode && (
                <p className="text-gray-500 text-xs mt-4">
                  Or press <span className="text-gray-400">Shift + →</span> to skip to next episode
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10">
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            title={currentModule.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          {!showControls && (
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); resetControlsTimeout(); }}
              style={{ zIndex: 15 }}
            />
          )}
        </div>
      )}

      {/* Top Controls Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden md:inline font-medium">Back to Browse</span>
        </button>

        <div className="text-center flex-1 mx-4">
          <p className="text-white font-semibold truncate">{course.title}</p>
          <p className="text-gray-400 text-sm truncate">
            Episode {currentModuleIndex + 1}: {currentModule.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreen}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevEpisode}
              disabled={!hasPrevEpisode}
              className={`p-2 rounded transition-colors ${hasPrevEpisode ? 'text-white hover:bg-white/20' : 'text-gray-600 cursor-not-allowed'}`}
              title="Previous Episode (Shift + Left Arrow)"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={goToNextEpisode}
              disabled={!hasNextEpisode}
              className={`p-2 rounded transition-colors ${hasNextEpisode ? 'text-white hover:bg-white/20' : 'text-gray-600 cursor-not-allowed'}`}
              title="Next Episode (Shift + Right Arrow)"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded transition-colors"
            >
              <List className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Episodes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Episodes Panel */}
      {showEpisodes && (
        <div className="absolute bottom-20 right-4 md:right-6 w-80 md:w-96 max-h-[60vh] z-30 bg-[#181818]/95 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">Episodes</h3>
              <p className="text-gray-400 text-sm">{course.modules.length} episodes</p>
            </div>
            <button
              onClick={() => setShowEpisodes(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(60vh-70px)]">
            {course.modules.map((module, index) => (
              <button
                key={module.id || index}
                onClick={() => selectEpisode(index)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors ${
                  index === currentModuleIndex ? 'bg-white/10' : ''
                }`}
              >
                <span className={`text-lg font-bold w-8 ${
                  index === currentModuleIndex ? 'text-white' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <div className="relative w-24 aspect-video rounded overflow-hidden flex-shrink-0">
                  <img
                    src={module.thumbnail || course.thumbnail}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                  {index === currentModuleIndex && !videoRestricted && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <span className="w-1 h-4 bg-white rounded animate-pulse" />
                        <span className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                  {restrictedVideos.has(module.videoId) && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      index === currentModuleIndex ? 'text-white' : 'text-gray-300'
                    }`}>
                      {module.title}
                    </p>
                    {restrictedVideos.has(module.videoId) && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-500 rounded">
                        External
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{module.duration}</p>
                </div>
                {index === currentModuleIndex && (
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Episode Preview */}
      {hasNextEpisode && showControls && !showEpisodes && (
        <div className="absolute bottom-24 right-4 md:right-6 z-25 hidden md:block">
          <button
            onClick={goToNextEpisode}
            className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors group"
          >
            <div className="relative w-28 aspect-video rounded overflow-hidden">
              <img
                src={course.modules[currentModuleIndex + 1].thumbnail || course.thumbnail}
                alt="Next episode"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Next Episode</p>
              <p className="text-white text-sm font-medium line-clamp-2 max-w-[140px]">
                {course.modules[currentModuleIndex + 1].title}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchClient;

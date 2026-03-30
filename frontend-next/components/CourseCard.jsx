'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Check, ChevronDown, ThumbsUp, Clock, User, Video } from 'lucide-react';

const CourseCard = ({ course, onPlay, onAddToList, isInList, onOpenModal, isExpanded = false, progress = null }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isHovered && course.modules?.[0]?.videoId) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
      }, 800);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setShowPreview(false);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovered, course.modules]);

  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(course);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    const videoIndex = progress?.currentVideoIndex || 0;
    onPlay(course, videoIndex);
  };

  const handleAddToListClick = (e) => {
    e.stopPropagation();
    onAddToList(course.id);
  };

  const formatCourseDuration = () => {
    if (course.duration) return course.duration;
    const videoCount = course.videoCount || course.modules?.length || 0;
    if (videoCount === 0) return '';
    if (videoCount === 1) return '1 video';
    return `${videoCount} videos`;
  };

  const getInstructor = () => {
    return course.channelTitle || course.universityName || 'Unknown Instructor';
  };

  const progressPercent = progress?.percentComplete ||
    (progress ? Math.round((progress.watchedVideos / progress.totalVideos) * 100) : 0);

  return (
    <div
      className={`relative flex-shrink-0 transition-all duration-300 ease-out cursor-pointer ${
        isExpanded ? 'w-[240px] md:w-[280px]' : 'w-[140px] md:w-[200px]'
      } ${isHovered ? 'z-30 scale-110 md:scale-[1.2]' : 'z-10 scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`course-card-${course.id}`}
    >
      {/* Main Card */}
      <div className={`relative rounded-md overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-2xl shadow-black/80' : ''
      }`}>
        {/* Thumbnail / Video Preview */}
        <div className={`relative ${
          isExpanded ? 'aspect-video' : 'aspect-[2/3] md:aspect-video'
        } overflow-hidden bg-zinc-900`}>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
          )}

          {/* Video Preview on Hover */}
          {showPreview && course.modules?.[0]?.videoId && (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${course.modules[0].videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${course.modules[0].videoId}&modestbranding=1&start=10`}
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              allow="autoplay; encrypted-media"
              frameBorder="0"
            />
          )}

          <img
            src={course.thumbnail}
            alt={course.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered && !showPreview ? 'scale-110' : 'scale-100'} ${showPreview ? 'opacity-0' : ''}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Clickable overlay */}
          <div
            className="absolute inset-0 z-30 cursor-pointer"
            onClick={handleCardClick}
          />

          {/* Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent z-20 pointer-events-none" />
          )}

          {/* Play Icon Overlay (non-hover) */}
          {!isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            {course.isOriginal && (
              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                E SERIES
              </span>
            )}
            {course.quality === '4K' && (
              <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                4K
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {progress && progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-30">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Quick Info Overlay on Hover */}
          {isHovered && !showPreview && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent z-20">
              <h4 className="text-white text-xs font-semibold line-clamp-2 mb-1">{course.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{getInstructor()}</span>
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expanded Info (on hover) */}
        {isHovered && (
          <div className="absolute top-full left-0 right-0 bg-[#181818] rounded-b-md p-3 animate-in fade-in slide-in-from-top-1 duration-200 z-30">
            <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">{course.title}</h3>

            {/* Progress Info */}
            {progress && (
              <div className="flex items-center gap-2 mb-2 text-xs">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-gray-400">{progressPercent}%</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handlePlayClick}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                data-testid={`play-btn-${course.id}`}
              >
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </button>
              <button
                onClick={handleAddToListClick}
                className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors group/btn"
                data-testid={`add-list-btn-${course.id}`}
              >
                {isInList ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-400 group-hover/btn:text-white" />
                )}
              </button>
              <button className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors group/btn">
                <ThumbsUp className="w-4 h-4 text-gray-400 group-hover/btn:text-white" />
              </button>
              <button
                onClick={handleCardClick}
                className="ml-auto w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors group/btn"
                data-testid={`more-info-btn-${course.id}`}
              >
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover/btn:text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs mb-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300 truncate">{getInstructor()}</span>
            </div>

            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="text-green-500 font-bold">{course.rating || 95}% Match</span>
              <span className="px-1.5 py-0.5 border border-gray-600 text-gray-400 text-[10px] flex items-center gap-1">
                <Video className="w-3 h-3" />
                {course.videoCount || 0} eps
              </span>
              {course.duration && (
                <span className="px-1.5 py-0.5 border border-gray-600 text-gray-400 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </span>
              )}
              <span className="px-1 border border-gray-600 text-gray-400 text-[10px]">
                {course.quality || 'HD'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-300">
              <span className="truncate">{course.category || 'General'}</span>
              <span className="text-gray-600">•</span>
              <span className="truncate">{course.universityName || 'Other'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Title (visible on mobile when not hovered) */}
      {!isHovered && (
        <div className="mt-2 md:hidden">
          <p className="text-white text-xs font-medium truncate">{course.title}</p>
          <p className="text-gray-500 text-[10px]">{course.universityName}</p>
        </div>
      )}
    </div>
  );
};

export default CourseCard;

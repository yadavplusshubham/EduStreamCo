'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Plus, Check, ThumbsUp, ThumbsDown, ChevronDown, Clock, User, Video } from 'lucide-react';

const CinematicModal = ({ course, onClose, onAddToList, isInList, onPlay }) => {
  const [activeModule, setActiveModule] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const currentModule = course.modules?.[activeModule];

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(course, activeModule);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" data-testid="cinematic-modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl mx-4 my-8 bg-[#181818] rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center hover:bg-[#282828] transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Hero Section */}
        <div className="relative aspect-video bg-black">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/60 to-transparent" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 group"
              data-testid="modal-play-center-btn"
            >
              <Play className="w-10 h-10 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              {course.isOriginal && (
                <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                  <span className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-white text-[8px] font-black">E</span>
                  SERIES
                </span>
              )}
              {course.featured && (
                <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">FEATURED</span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h2>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-white/90 transition-all"
                data-testid="modal-play-btn"
              >
                <Play className="w-5 h-5 fill-current" />
                Play
              </button>
              <button
                onClick={() => onAddToList(course.id)}
                className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
              >
                {isInList ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </button>
              <button className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <ThumbsUp className="w-5 h-5 text-white" />
              </button>
              <button className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <ThumbsDown className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                <span className="text-green-500 font-bold">{course.rating || 95}% Match</span>
                <span className="text-gray-400">{course.year || new Date().getFullYear()}</span>
                <span className="px-1.5 py-0.5 border border-gray-600 text-gray-400 text-xs flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  {course.videoCount || course.modules?.length || 0} episodes
                </span>
                {course.duration && (
                  <span className="px-1.5 py-0.5 border border-gray-600 text-gray-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                )}
                <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded text-xs font-semibold text-white">
                  {course.quality || 'HD'}
                  {course.quality === '4K' && <span className="text-yellow-500">HDR</span>}
                </span>
              </div>

              <div className="mb-6">
                <p className={`text-gray-300 leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
                  {course.description || 'A comprehensive educational course.'}
                </p>
                {course.description && course.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-white text-sm font-medium mt-2 flex items-center gap-1 hover:text-gray-300 transition-colors"
                  >
                    {showFullDescription ? 'Show Less' : 'Show More'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Instructor/Channel
                </p>
                <p className="text-white">{course.channelTitle || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">University</p>
                <p className="text-white">{course.universityName || 'Other'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Category</p>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                  {course.category || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          {course.modules && course.modules.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Episodes</h3>
                <span className="text-gray-400 text-sm">{course.modules.length} episodes</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {course.modules.map((module, index) => (
                  <button
                    key={module.id || index}
                    onClick={() => {
                      setActiveModule(index);
                      onPlay(course, index);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                      index === activeModule
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className={`text-2xl font-bold w-8 flex-shrink-0 ${
                      index === activeModule ? 'text-white' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>

                    <div className="relative w-28 aspect-video rounded overflow-hidden flex-shrink-0">
                      <img
                        src={module.thumbnail || course.thumbnail}
                        alt={module.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <h4 className={`font-medium truncate ${
                        index === activeModule ? 'text-white' : 'text-gray-300'
                      }`}>
                        {module.title}
                      </h4>
                      <p className="text-gray-500 text-sm">{module.duration || ''}</p>
                    </div>

                    {index === activeModule && (
                      <div className="flex gap-0.5 flex-shrink-0">
                        <span className="w-1 h-4 bg-red-500 rounded animate-pulse" />
                        <span className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CinematicModal;

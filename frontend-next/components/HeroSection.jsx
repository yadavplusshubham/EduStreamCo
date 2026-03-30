'use client';

import { useState, useEffect } from 'react';
import { Play, Plus, Info, Volume2, VolumeX, Check } from 'lucide-react';

const HeroSection = ({ courses, onPlay, onAddToList, myList, onOpenModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentCourse = courses[currentIndex];
  const isInList = myList.includes(currentCourse?.id);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [courses.length]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!currentCourse) return null;

  const heroImage = currentCourse.thumbnail ||
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80';

  return (
    <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={currentCourse.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/50" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center pt-24 md:pt-32 pb-20 md:pb-28 px-6 md:px-16 lg:px-20">
        {/* Badges */}
        <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
          {currentCourse.isOriginal && (
            <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold tracking-wider">
              <span className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-black">E</span>
              SERIES
            </span>
          )}
          {currentCourse.featured && (
            <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-xs font-semibold text-white">
              FEATURED
            </span>
          )}
          <span className="text-gray-300 text-xs font-medium">
            #{currentIndex + 1} in Education
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 max-w-3xl leading-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          {currentCourse.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-sm animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
          <span className="text-green-500 font-bold">{currentCourse.rating || 95}% Match</span>
          <span className="text-gray-400">{currentCourse.year || new Date().getFullYear()}</span>
          <span className="px-1.5 py-0.5 border border-gray-500 text-gray-300 text-xs rounded">
            {currentCourse.duration || `${currentCourse.videoCount} videos`}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded text-xs font-semibold">
            {currentCourse.quality || 'HD'}
            {currentCourse.quality === '4K' && (
              <span className="text-yellow-500">HDR</span>
            )}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm md:text-base max-w-xl mb-5 line-clamp-3 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          {currentCourse.description || `A comprehensive course with ${currentCourse.videoCount} lectures.`}
        </p>

        {/* Channel/Instructor */}
        <div className="flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-left-4 duration-700 delay-250">
          <span className="text-gray-400 text-sm">From:</span>
          <span className="text-white text-sm font-medium">{currentCourse.channelTitle}</span>
          <span className="text-gray-500 text-sm">• {currentCourse.universityName}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <button
            onClick={() => onPlay(currentCourse)}
            className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-white text-black font-bold rounded hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            data-testid="hero-play-btn"
          >
            <Play className="w-5 h-5 fill-current" />
            Play
          </button>
          <button
            onClick={() => onAddToList(currentCourse.id)}
            className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
            data-testid="hero-mylist-btn"
          >
            {isInList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isInList ? 'In My List' : 'My List'}
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal(currentCourse)}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded hover:bg-white/20 transition-all"
            data-testid="hero-moreinfo-btn"
          >
            <Info className="w-5 h-5" />
            More Info
          </button>
        </div>
      </div>

      {/* Volume Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute right-6 md:right-12 bottom-32 md:bottom-36 p-2 border border-white/40 rounded-full text-white hover:bg-white/10 transition-all"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Dots Navigation */}
      {courses.length > 1 && (
        <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {courses.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;

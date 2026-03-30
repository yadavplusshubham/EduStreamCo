'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseCard from './CourseCard';

const CourseRow = ({ title, courses, onPlay, onAddToList, myList, showRank = false, onOpenModal, isFeatured = false, watchProgress = {} }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div
      className={`relative group/row ${isFeatured ? 'py-2' : 'py-1 md:py-2'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <h2 className={`px-6 md:px-16 font-bold text-white mb-2 flex items-center gap-2 group cursor-pointer hover:text-gray-300 transition-colors ${
        isFeatured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
      }`}>
        {title}
        <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
      </h2>

      {/* Scrollable Row */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-gradient-to-r from-[#141414] to-transparent transition-opacity duration-300 ${
            showLeftArrow && isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-8 h-8 text-white hover:scale-125 transition-transform" />
        </button>

        {/* Cards Container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className={`flex gap-1.5 md:gap-2 px-6 md:px-16 overflow-x-auto scrollbar-hide scroll-smooth ${
            isFeatured ? 'pb-28' : 'pb-20'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course, index) => (
            <div key={course.id} className="relative flex-shrink-0">
              {/* Rank Number */}
              {showRank && (
                <div className="absolute -left-4 md:-left-6 top-0 bottom-0 flex items-center z-0">
                  <span
                    className="text-6xl md:text-8xl font-black text-transparent select-none"
                    style={{ WebkitTextStroke: '2px rgba(128, 128, 128, 0.5)' }}
                  >
                    {index + 1}
                  </span>
                </div>
              )}
              <CourseCard
                course={course}
                onPlay={onPlay}
                onAddToList={onAddToList}
                isInList={myList.includes(course.id)}
                onOpenModal={onOpenModal}
                isExpanded={showRank || isFeatured}
                progress={watchProgress[course.id]}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-gradient-to-l from-[#141414] to-transparent transition-opacity duration-300 ${
            showRightArrow && isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-8 h-8 text-white hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CourseRow;

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, BookOpen, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [watchProgress, setWatchProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProgress = localStorage.getItem('edustream-progress');
    if (savedProgress) {
      try {
        setWatchProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  const watchedCourses = courses
    .filter(course => watchProgress[course.id])
    .sort((a, b) => {
      const dateA = new Date(watchProgress[a.id]?.lastWatched || 0);
      const dateB = new Date(watchProgress[b.id]?.lastWatched || 0);
      return dateB - dateA;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Courses</h1>
            <p className="text-gray-400 text-sm mt-1">Your watch history and progress</p>
          </div>
        </div>

        {watchedCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No courses yet</h2>
            <p className="text-gray-400 mb-6">Start watching courses to see them here</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {watchedCourses.map(course => {
              const progress = watchProgress[course.id];
              const percentComplete = progress?.percentComplete ||
                Math.round((progress?.watchedVideos / progress?.totalVideos) * 100) || 0;

              return (
                <div
                  key={course.id}
                  className="bg-[#181818] rounded-xl border border-white/10 p-4 md:p-6 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/watch/${course.id}?module=${progress?.currentVideoIndex || 0}`)}
                >
                  <div className="flex gap-4 md:gap-6">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-32 md:w-48 aspect-video rounded-lg overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-white fill-white" />
                      </div>
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${percentComplete}%` }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg md:text-xl line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">{course.channelTitle}</p>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-green-500 font-medium">{percentComplete}% complete</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Episode {(progress?.currentVideoIndex || 0) + 1} of {progress?.totalVideos || course.videoCount}
                        </span>
                      </div>

                      <p className="text-gray-500 text-xs mt-2">
                        Last watched: {formatDate(progress?.lastWatched)}
                      </p>
                    </div>

                    {/* Continue Button */}
                    <div className="hidden md:flex items-center">
                      <button className="px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

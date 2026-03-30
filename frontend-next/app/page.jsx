'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CourseRow from '../components/CourseRow';
import CinematicModal from '../components/CinematicModal';
import SearchResults from '../components/SearchResults';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [myList, setMyList] = useState([]);
  const myListRef = useRef(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [watchProgress, setWatchProgress] = useState({});

  const refreshCourses = async () => {
    try {
      const response = await fetch(`${API}/courses`);
      const data = await response.json();
      setCourses(data);
      const uniqueCategories = [...new Set(data.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API}/courses`);
        const data = await response.json();
        setCourses(data);
        const uniqueCategories = [...new Set(data.map(c => c.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();

    const savedList = localStorage.getItem('edustream-mylist');
    if (savedList) {
      try { setMyList(JSON.parse(savedList)); } catch {}
    }

    const savedProgress = localStorage.getItem('edustream-progress');
    if (savedProgress) {
      try { setWatchProgress(JSON.parse(savedProgress)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('edustream-mylist', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    if (Object.keys(watchProgress).length > 0) {
      localStorage.setItem('edustream-progress', JSON.stringify(watchProgress));
    }
  }, [watchProgress]);

  const updateProgress = (courseId, currentVideoIndex, totalVideos) => {
    const newProgress = {
      ...watchProgress,
      [courseId]: {
        currentVideoIndex,
        watchedVideos: currentVideoIndex + 1,
        totalVideos,
        lastWatched: new Date().toISOString(),
      },
    };
    setWatchProgress(newProgress);
    localStorage.setItem('edustream-progress', JSON.stringify(newProgress));
  };

  const handlePlay = (course, moduleIndex = 0) => {
    setSelectedCourse(null);
    const totalVideos = course.modules?.length || course.videoCount || 1;
    updateProgress(course.id, moduleIndex, totalVideos);
    router.push(`/watch/${course.id}?module=${moduleIndex}`);
  };

  const handleOpenModal = (course) => setSelectedCourse(course);
  const handleCloseModal = () => setSelectedCourse(null);

  const handleAddToList = (courseId) => {
    setMyList((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchQuery('');
      return;
    }
    const results = courses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.channelTitle?.toLowerCase().includes(query.toLowerCase()) ||
      course.category?.toLowerCase().includes(query.toLowerCase()) ||
      course.universityName?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleNavigateToMyList = () => {
    if (myListRef.current) {
      myListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredCourses = selectedCategory
    ? courses.filter(c => c.category === selectedCategory)
    : courses;

  const featuredCourses = filteredCourses.filter((c) => c.featured);
  const myListCourses = courses.filter((c) => myList.includes(c.id));

  const coursesByUniversity = filteredCourses.reduce((acc, course) => {
    const key = course.university || 'other';
    if (!acc[key]) acc[key] = { name: course.universityName || 'Other', courses: [] };
    acc[key].courses.push(course);
    return acc;
  }, {});

  const coursesByCategory = !selectedCategory
    ? filteredCourses.reduce((acc, course) => {
        const key = course.category || 'General';
        if (!acc[key]) acc[key] = [];
        acc[key].push(course);
        return acc;
      }, {})
    : {};

  const continueWatchingCourses = courses
    .filter(course => watchProgress[course.id] && watchProgress[course.id].watchedVideos < watchProgress[course.id].totalVideos)
    .sort((a, b) => {
      const dateA = new Date(watchProgress[a.id]?.lastWatched || 0);
      const dateB = new Date(watchProgress[b.id]?.lastWatched || 0);
      return dateB - dateA;
    });

  if (!isLoading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome to EduStream
            </h1>
            <p className="text-gray-400 mb-8">
              No courses have been added yet. Go to the Admin panel to add your first YouTube playlist!
            </p>
            <button
              onClick={() => router.push('/edusigninup')}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
            >
              Go to Admin Panel
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onNavigateToMyList={handleNavigateToMyList}
      />

      {searchResults !== null ? (
        <SearchResults
          results={searchResults}
          query={searchQuery}
          onClear={handleClearSearch}
          onPlay={handlePlay}
          onAddToList={handleAddToList}
          onOpenModal={handleOpenModal}
          myList={myList}
          onRefreshCourses={refreshCourses}
        />
      ) : (
        <main>
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-b from-[#141414] via-[#141414]/95 to-transparent py-3 px-6 md:px-16">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    !selectedCategory ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hero Section */}
          {!selectedCategory && (featuredCourses.length > 0 ? (
            <HeroSection
              courses={featuredCourses}
              onPlay={handlePlay}
              onAddToList={handleAddToList}
              onOpenModal={handleOpenModal}
              myList={myList}
            />
          ) : filteredCourses.length > 0 ? (
            <HeroSection
              courses={filteredCourses.slice(0, 5)}
              onPlay={handlePlay}
              onAddToList={handleAddToList}
              onOpenModal={handleOpenModal}
              myList={myList}
            />
          ) : null)}

          {/* Course Rows */}
          <div className={`${!selectedCategory ? '-mt-24' : 'mt-4'} relative z-10 space-y-0`}>
            {/* Continue Watching */}
            {!selectedCategory && continueWatchingCourses.length > 0 && (
              <CourseRow
                title="Continue Watching"
                courses={continueWatchingCourses}
                onPlay={handlePlay}
                onAddToList={handleAddToList}
                onOpenModal={handleOpenModal}
                myList={myList}
                watchProgress={watchProgress}
                isFeatured
              />
            )}

            {/* Featured Courses */}
            {!selectedCategory && featuredCourses.length > 0 && (
              <CourseRow
                title="Featured Courses"
                courses={featuredCourses}
                onPlay={handlePlay}
                onAddToList={handleAddToList}
                onOpenModal={handleOpenModal}
                myList={myList}
                showRank
                isFeatured
              />
            )}

            {/* My List */}
            {!selectedCategory && myListCourses.length > 0 && (
              <div ref={myListRef}>
                <CourseRow
                  title="My List"
                  courses={myListCourses}
                  onPlay={handlePlay}
                  onAddToList={handleAddToList}
                  onOpenModal={handleOpenModal}
                  myList={myList}
                  watchProgress={watchProgress}
                />
              </div>
            )}

            {/* Category filtered results */}
            {selectedCategory && (
              <CourseRow
                title={selectedCategory}
                courses={filteredCourses}
                onPlay={handlePlay}
                onAddToList={handleAddToList}
                onOpenModal={handleOpenModal}
                myList={myList}
                watchProgress={watchProgress}
              />
            )}

            {/* By University */}
            {!selectedCategory && Object.entries(coursesByUniversity).map(([key, { name, courses: uniCourses }]) => (
              uniCourses.length > 0 && (
                <CourseRow
                  key={key}
                  title={name}
                  courses={uniCourses}
                  onPlay={handlePlay}
                  onAddToList={handleAddToList}
                  onOpenModal={handleOpenModal}
                  myList={myList}
                  watchProgress={watchProgress}
                />
              )
            ))}

            {/* By Category */}
            {!selectedCategory && Object.entries(coursesByCategory).map(([category, catCourses]) => (
              catCourses.length > 2 && (
                <CourseRow
                  key={category}
                  title={category}
                  courses={catCourses}
                  onPlay={handlePlay}
                  onAddToList={handleAddToList}
                  onOpenModal={handleOpenModal}
                  myList={myList}
                  watchProgress={watchProgress}
                />
              )
            ))}

            {/* All Courses */}
            {filteredCourses.length > 0 && (
              <CourseRow
                title={selectedCategory ? `More ${selectedCategory}` : 'All Courses'}
                courses={filteredCourses}
                onPlay={handlePlay}
                onAddToList={handleAddToList}
                onOpenModal={handleOpenModal}
                myList={myList}
                watchProgress={watchProgress}
              />
            )}
          </div>
        </main>
      )}

      <Footer />

      {/* Cinematic Modal */}
      {selectedCourse && (
        <CinematicModal
          course={selectedCourse}
          onClose={handleCloseModal}
          onAddToList={handleAddToList}
          isInList={myList.includes(selectedCourse.id)}
          onPlay={handlePlay}
        />
      )}
    </div>
  );
}

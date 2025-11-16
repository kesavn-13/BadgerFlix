'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Course } from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [coursesBySubject, setCoursesBySubject] = useState<Record<string, Course[]>>({});
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [myList, setMyList] = useState<string[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (!token || role !== 'student') {
      router.push('/login');
      return;
    }
    
    if (name) setUserName(name);

    async function loadData() {
      try {
        // Load subjects first
        const subjectsList = await apiClient.getSubjects();
        setSubjects(subjectsList);

        // Load all courses in parallel
        const coursePromises = subjectsList.map(subject => 
          apiClient.getCoursesBySubject(subject).catch(err => {
            console.error(`Error loading courses for ${subject}:`, err);
            return [];
          })
        );
        
        const coursesArrays = await Promise.all(coursePromises);
        
        const coursesData: Record<string, Course[]> = {};
        subjectsList.forEach((subject, index) => {
          coursesData[subject] = coursesArrays[index] || [];
        });
        
        setCoursesBySubject(coursesData);

        // Load progress data
        try {
          const progress = await apiClient.getProgress();
          setWatchedEpisodes(progress.watched_episodes || []);
          setCompletedCourses(progress.completed_courses || []);
          setMyList(progress.my_list || []);
        } catch (err) {
          console.error('Error loading progress:', err);
        }

        // Load continue watching
        try {
          const continueData = await apiClient.getContinueWatching();
          setContinueWatching(continueData || []);
        } catch (err) {
          console.error('Error loading continue watching:', err);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await apiClient.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Same homepage content but with student dashboard header
  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent pb-8">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link href="/student/dashboard" className="text-3xl font-bold text-netflix-red">
            BadgerFlix
          </Link>
          <div className="flex gap-6 items-center">
            <span className="text-white">Welcome, {userName || 'Student'}</span>
            <Link href="/upload" className="text-white hover:text-gray-300">
              Upload
            </Link>
            <Link href="/achievements" className="text-white hover:text-gray-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="hidden md:inline">Achievements</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative h-[85vh] flex items-center justify-center bg-gradient-to-br from-netflix-red/30 via-netflix-black to-netflix-black overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-netflix-red rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center px-8 relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-netflix-red/20 border border-netflix-red/50 rounded-full text-netflix-red text-sm font-semibold mb-4 uppercase tracking-wide">
              AI-Powered Learning Platform
            </span>
          </div>
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Welcome to BadgerFlix
          </h1>
          <p className="text-3xl text-gray-300 mb-4 font-light">
            Netflix for University Lectures
          </p>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Transform long lectures into bingeable episodes. Learn with AI tutors, flashcards, quizzes, and master any subject at your own pace.
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>AI-Generated Episodes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>AI Tutor Support</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>Study Tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <div className="px-8 -mt-32 relative z-10 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Continue Watching</h2>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
            {continueWatching.map((course) => {
              const progress = course.progress || 0;
              return (
                <Link
                  key={course.course_id}
                  href={`/course/${course.course_id}`}
                  className="flex-shrink-0 w-64 group cursor-pointer"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-netflix-red/20 to-blue-600/20 rounded-lg overflow-hidden border border-netflix-red/30">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                        <p className="text-xs text-gray-400 mb-2">{course.subject}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-netflix-red h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {course.watched_episodes} / {course.total_episodes} Episodes
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Rows */}
      <div className={`px-8 ${continueWatching.length > 0 ? '' : '-mt-32 relative z-10'}`}>
        {subjects.map((subject) => {
          const courses = coursesBySubject[subject] || [];
          if (courses.length === 0) return null;

          const gradients = [
            'from-netflix-red/30 to-blue-600/30',
            'from-purple-600/30 to-pink-600/30',
            'from-green-600/30 to-teal-600/30',
            'from-yellow-600/30 to-orange-600/30',
            'from-indigo-600/30 to-purple-600/30',
          ];
          const gradient = gradients[subjects.indexOf(subject) % gradients.length];

          return (
            <div key={subject} className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">{subject}</h2>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {courses.map((course, idx) => {
                  const isCompleted = completedCourses.includes(course.id);
                  const isInMyList = myList.includes(course.id);
                  const watchedCount = course.episode_ids?.filter((eid: string) => watchedEpisodes.includes(eid)).length || 0;
                  const progress = course.episode_ids ? (watchedCount / course.episode_ids.length * 100) : 0;

                  return (
                    <div key={course.id} className="flex-shrink-0 w-64 group animate-fade-in relative">
                      <Link
                        href={`/course/${course.id}`}
                        className="cursor-pointer"
                      >
                        <div className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-netflix-red/50 group-hover:z-10 bg-gradient-to-br ${gradient}`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-4">
                              <div className="mb-3">
                                <div className="inline-block px-3 py-1 bg-black/50 rounded-full text-xs font-semibold text-white mb-2">
                                  {course.subject}
                                </div>
                              </div>
                              <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">{course.title}</h3>
                              <div className="flex items-center justify-center gap-2 text-xs text-white/90">
                                <span className="bg-white/20 px-2 py-1 rounded">📺</span>
                                <span>{course.episode_count || 0} Episodes</span>
                              </div>
                              {progress > 0 && (
                                <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                                  <div
                                    className="bg-netflix-red h-1 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="absolute top-2 right-2 bg-netflix-red rounded-full p-2 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-start justify-between">
                          <p className="text-sm text-gray-400 group-hover:text-white transition-colors line-clamp-2 flex-1">
                            {course.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isInMyList) {
                                apiClient.removeFromMyList(course.id).then(() => {
                                  setMyList(myList.filter(id => id !== course.id));
                                });
                              } else {
                                apiClient.addToMyList(course.id).then(() => {
                                  setMyList([...myList, course.id]);
                                });
                              }
                            }}
                            className="ml-2 p-2 hover:bg-gray-800 rounded transition-colors"
                            title={isInMyList ? "Remove from My List" : "Add to My List"}
                          >
                            {isInMyList ? (
                              <svg className="w-5 h-5 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


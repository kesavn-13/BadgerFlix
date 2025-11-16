'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Course, Episode } from '@/lib/api';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const courseData = await apiClient.getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent pb-8">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link href="/" className="text-3xl font-bold text-netflix-red">
            BadgerFlix
          </Link>
          <div className="flex gap-6">
            <Link href="/upload" className="text-white hover:text-gray-300">
              Upload
            </Link>
            <Link href="/instructor" className="text-white hover:text-gray-300">
              Instructor
            </Link>
          </div>
        </nav>
      </header>

      {/* Course Banner */}
      <div className="relative h-[60vh] bg-gradient-to-r from-netflix-red/40 to-netflix-black flex items-center justify-center">
        <div className="text-center px-8">
          <h1 className="text-5xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-gray-300 mb-2">{course.subject}</p>
          <p className="text-lg text-gray-400 max-w-2xl">{course.description}</p>
        </div>
      </div>

      {/* Episodes */}
      <div className="px-8 -mt-32 relative z-10 pb-16">
        <h2 className="text-3xl font-bold mb-6 text-white">Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.episodes?.map((episode, index) => {
            const episodeGradients = [
              "from-blue-600/50 to-purple-600/50",
              "from-red-600/50 to-pink-600/50",
              "from-green-600/50 to-teal-600/50",
              "from-yellow-600/50 to-orange-600/50",
              "from-indigo-600/50 to-blue-600/50",
              "from-purple-600/50 to-red-600/50",
            ];
            const gradient = episodeGradients[index % episodeGradients.length];
            
            return (
              <Link
                key={episode.id}
                href={`/episode/${episode.id}`}
                className="bg-netflix-dark rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-800 hover:border-netflix-red/50"
              >
                <div className={`aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                  {/* Episode number badge */}
                  <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-full text-sm font-bold text-white">
                    E{index + 1}
                  </div>
                  {/* Play icon on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                      <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Default episode icon */}
                  <div className="opacity-100 group-hover:opacity-0 transition-opacity">
                    <div className="text-5xl font-bold text-white/30">E{index + 1}</div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-netflix-red transition-colors">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{episode.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📌</span>
                      <span>{episode.key_points.length} key points</span>
                    </div>
                    <button className="px-4 py-2 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm">
                      Watch →
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}



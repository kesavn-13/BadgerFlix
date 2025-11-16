'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [achievementsData, progressData] = await Promise.all([
          apiClient.getAchievements(),
          apiClient.getProgress()
        ]);
        setAchievements(achievementsData);
        setProgress(progressData);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
            <Link href="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link href="/upload" className="text-white hover:text-gray-300">
              Upload
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="pt-24 px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-white">Movie Collection</h1>
          <p className="text-xl text-gray-400 mb-8">
            Your achievements and progress in the world of learning
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-netflix-red/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 mb-4">
                  <svg className="w-6 h-6 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'monospace' }}>{unlockedCount} / {totalCount}</div>
                <div className="text-gray-400 uppercase text-sm tracking-wide">Achievements Unlocked</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-netflix-red/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 mb-4">
                  <svg className="w-6 h-6 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'monospace' }}>{progress?.watched_episodes?.length || 0}</div>
                <div className="text-gray-400 uppercase text-sm tracking-wide">Episodes Watched</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-netflix-red/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 mb-4">
                  <svg className="w-6 h-6 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 4h2v16h-2V4zM2 4h2v16H2V4zm5 0h10v16H7V4z"/>
                  </svg>
                </div>
                <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'monospace' }}>{progress?.completed_courses?.length || 0}</div>
                <div className="text-gray-400 uppercase text-sm tracking-wide">Courses Completed</div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border-2 transition-all overflow-hidden ${
                  achievement.unlocked
                    ? 'border-netflix-red shadow-lg shadow-netflix-red/50'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                {/* Film grain overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}></div>
                
                {/* Spotlight effect for unlocked */}
                {achievement.unlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-netflix-red/20 rounded-full blur-2xl"></div>
                )}
                
                <div className="relative">
                  {/* Icon container */}
                  <div className={`mb-4 text-center ${
                    achievement.unlocked ? '' : 'grayscale'
                  }`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 border-2 rounded-lg ${
                      achievement.unlocked 
                        ? 'border-netflix-red bg-netflix-red/10' 
                        : 'border-gray-700 bg-gray-800/50'
                    }`}>
                      {achievement.unlocked ? (
                        <svg className="w-10 h-10 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 text-center uppercase tracking-wide ${
                    achievement.unlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className="text-gray-400 text-center mb-4 text-sm">
                    {achievement.description}
                  </p>
                  
                  {achievement.unlocked && (
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 bg-netflix-red/20 text-netflix-red rounded-lg text-sm font-bold uppercase tracking-wider border border-netflix-red/50">
                        Unlocked
                      </span>
                    </div>
                  )}
                  {!achievement.unlocked && (
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm uppercase tracking-wider border border-gray-700">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


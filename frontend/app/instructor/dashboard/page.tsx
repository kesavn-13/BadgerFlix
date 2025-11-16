'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function InstructorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (!token || role !== 'instructor') {
      router.push('/login');
      return;
    }
    
    if (name) setUserName(name);
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent pb-8">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link href="/instructor/dashboard" className="text-3xl font-bold text-netflix-red">
            BadgerFlix
          </Link>
          <div className="flex gap-6 items-center">
            <span className="text-white">Welcome, {userName || 'Instructor'}</span>
            <Link href="/upload" className="text-white hover:text-gray-300">
              Upload Course
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
      <div className="relative h-[50vh] flex items-center justify-center bg-gradient-to-br from-netflix-red/30 via-netflix-black to-netflix-black overflow-hidden pt-24">
        <div className="relative z-10 text-center px-8">
          <h1 className="text-6xl font-black mb-6 text-white" style={{ textShadow: '0 0 40px rgba(229, 9, 20, 0.5)' }}>
            Instructor Dashboard
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Manage your courses and content</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="px-8 -mt-32 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Course Card */}
          <Link
            href="/upload"
            className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-8 border-2 border-netflix-red/50 hover:border-netflix-red transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 mx-auto mb-4">
                <svg className="w-10 h-10 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Upload Course</h3>
              <p className="text-gray-400">Upload lecture audio/video and generate Netflix-style episodes</p>
            </div>
          </Link>

          {/* View Courses Card */}
          <Link
            href="/"
            className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-8 border-2 border-netflix-red/50 hover:border-netflix-red transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 mx-auto mb-4">
                <svg className="w-10 h-10 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">View All Courses</h3>
              <p className="text-gray-400">Browse all available courses in the platform</p>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-white">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30">
              <div className="text-4xl font-bold text-netflix-red mb-2">0</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Courses Created</div>
            </div>
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30">
              <div className="text-4xl font-bold text-netflix-red mb-2">0</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Total Episodes</div>
            </div>
            <div className="bg-gradient-to-br from-netflix-dark to-netflix-black rounded-lg p-6 border border-netflix-red/30">
              <div className="text-4xl font-bold text-netflix-red mb-2">0</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Students Enrolled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


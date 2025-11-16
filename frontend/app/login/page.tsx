'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiClient.login(email, password, role);
      
      // Store token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('user_id', result.user_id);
      localStorage.setItem('role', result.role);
      localStorage.setItem('name', result.name);
      
      // Redirect to appropriate dashboard
      if (result.role === 'instructor') {
        router.push('/instructor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/10 via-netflix-black to-netflix-black"></div>
      
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-5xl font-bold text-netflix-red inline-block">
            BadgerFlix
          </Link>
          <p className="text-gray-400 mt-2">Movie-Themed Learning Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-netflix-dark via-netflix-black to-netflix-dark rounded-2xl p-8 border border-netflix-red/30 shadow-2xl relative overflow-hidden">
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-6 text-center uppercase tracking-wide">Login</h1>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">Login As</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    role === 'student'
                      ? 'border-netflix-red bg-netflix-red/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span className="font-semibold">Student</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    role === 'instructor'
                      ? 'border-netflix-red bg-netflix-red/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-semibold">Instructor</span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold uppercase tracking-wide"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


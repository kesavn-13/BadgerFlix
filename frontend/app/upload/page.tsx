'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Biology',
  'Economics',
  'Engineering',
  'Productivity & Skills',
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await apiClient.uploadLecture(file, title, subject);
      // Redirect to homepage to see the new course
      router.push('/');
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Handle different error formats
      let errorMessage = 'Error uploading lecture. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // If detail is a string, use it
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // If detail is an array (validation errors), extract messages
        else if (Array.isArray(errorData.detail)) {
          const messages = errorData.detail.map((e: any) => {
            if (typeof e === 'string') return e;
            if (e.msg) return `${e.loc?.join('.') || 'Field'}: ${e.msg}`;
            return JSON.stringify(e);
          });
          errorMessage = messages.join(', ');
        }
        // If detail is an object, stringify it
        else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
        // Fallback to message if available
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

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
            <Link href="/instructor" className="text-white hover:text-gray-300">
              Instructor
            </Link>
          </div>
        </nav>
      </header>

      {/* Upload Form */}
      <div className="pt-32 px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Upload Lecture</h1>
          <p className="text-gray-400 mb-8">
            Upload a lecture audio/video file. Our AI will transcribe it and break it into
            bingeable Netflix-style episodes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Lecture File (Audio/Video)</label>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="w-full px-6 py-4 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {uploading ? 'Processing... (This may take a minute)' : 'Generate Course'}
            </button>
          </form>

          <div className="mt-8 p-6 bg-netflix-dark rounded-lg">
            <h3 className="text-xl font-bold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Upload your lecture audio or video file</li>
              <li>AI transcribes the content using Whisper</li>
              <li>GPT breaks it into 4-6 bingeable episodes</li>
              <li>Each episode gets summaries, key points, and AI tutor support</li>
              <li>Your course appears in the catalog immediately</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}


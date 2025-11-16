'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Question } from '@/lib/api';

export default function InstructorPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const data = await apiClient.getUnansweredQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.answerQuestion(questionId, answerText);
      setAnswerText('');
      setAnsweringId(null);
      await loadQuestions(); // Reload to remove answered question
      alert('Answer published successfully!');
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Error publishing answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

      {/* Instructor Dashboard */}
      <div className="pt-32 px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Instructor Dashboard</h1>
          <p className="text-gray-400 mb-8">
            Answer student questions. All questions are submitted anonymously to encourage
            participation.
          </p>

          {questions.length === 0 ? (
            <div className="bg-netflix-dark rounded-lg p-8 text-center">
              <p className="text-gray-400 text-xl">No pending questions</p>
              <p className="text-gray-500 mt-2">All questions have been answered!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-netflix-dark rounded-lg p-6 border border-gray-700"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        Episode ID: {question.episode_id}
                      </span>
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                        {question.is_anonymous ? 'Anonymous' : 'Named'}
                      </span>
                    </div>
                    <p className="text-white text-lg">{question.question_text}</p>
                  </div>

                  {answeringId === question.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                        rows={4}
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAnswer(question.id)}
                          disabled={submitting || !answerText.trim()}
                          className="px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Publishing...' : 'Publish Answer'}
                        </button>
                        <button
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText('');
                          }}
                          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringId(question.id);
                        setAnswerText('');
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Answer Question
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Analytics Section */}
          <div className="mt-12 bg-netflix-dark rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Pending Questions</p>
                <p className="text-3xl font-bold text-netflix-red">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Episodes</p>
                <p className="text-3xl font-bold text-netflix-red">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



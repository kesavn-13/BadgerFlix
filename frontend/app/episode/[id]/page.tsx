'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Episode } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Simple markdown renderer for AI responses
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let inList = false;
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(' ');
      elements.push(
        <p key={key++} className="mb-4 leading-relaxed">
          {parseInlineMarkdown(paragraphText)}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside mb-4 space-y-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-300">
              {parseInlineMarkdown(item.trim())}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Check for list items
    if (trimmed.match(/^[\d]+\.\s+|^[-*]\s+/)) {
      flushParagraph();
      inList = true;
      const listText = trimmed.replace(/^[\d]+\.\s+|^[-*]\s+/, '');
      listItems.push(listText);
    } else if (trimmed === '') {
      // Empty line
      flushList();
      flushParagraph();
    } else {
      // Regular text
      flushList();
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.split('**').length === 3) {
        // Standalone bold heading
        flushParagraph();
        const headingText = trimmed.replace(/\*\*/g, '');
        elements.push(
          <h3 key={key++} className="text-xl font-bold mb-3 mt-4 text-white">
            {headingText}
          </h3>
        );
      } else {
        currentParagraph.push(trimmed);
      }
    }
  });

  flushList();
  flushParagraph();

  return elements.length > 0 ? <>{elements}</> : <p className="text-white whitespace-pre-wrap">{text}</p>;
}

// Parse inline markdown (bold, italic)
function parseInlineMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let currentIndex = 0;
  let key = 0;

  // Pattern for **bold** (must be **text**, not ***text***)
  // and *italic* (single asterisk, not part of **)
  const markdownPattern = /(\*\*[^*]+\*\*|\*[^*\*]+\*)/g;
  let match;
  const processedIndices = new Set<number>();

  while ((match = markdownPattern.exec(text)) !== null) {
    // Skip if we've already processed this index (avoid double processing)
    if (processedIndices.has(match.index)) {
      continue;
    }

    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }

    const matchedText = match[0];
    if (matchedText.startsWith('**') && matchedText.endsWith('**') && matchedText.length > 4) {
      // Bold text (**text**)
      const boldText = matchedText.slice(2, -2);
      parts.push(
        <strong key={key++} className="font-bold text-white">
          {boldText}
        </strong>
      );
      processedIndices.add(match.index);
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*') && !matchedText.startsWith('**')) {
      // Italic text (*text*), but not if it's part of **bold**
      const italicText = matchedText.slice(1, -1);
      parts.push(
        <em key={key++} className="italic text-gray-200">
          {italicText}
        </em>
      );
      processedIndices.add(match.index);
    } else {
      // If it doesn't match our patterns, just add as text
      parts.push(matchedText);
    }

    currentIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function EpisodePage() {
  const router = useRouter();
  const params = useParams();
  const episodeId = params.id as string;
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // WhisperChat Enhancements
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showQuizCompletion, setShowQuizCompletion] = useState(false);
  const [achievementProgress, setAchievementProgress] = useState<{name: string, progress: number} | null>(null);
  
  const [slides, setSlides] = useState<any[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadEpisode() {
      try {
        const episodeData = await apiClient.getEpisode(episodeId);
        setEpisode(episodeData);
        
        // Check if episode is watched
        const progress = await apiClient.getProgress();
        setIsWatched(progress.watched_episodes?.includes(episodeId) || false);
      } catch (error) {
        console.error('Error loading episode:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEpisode();
  }, [episodeId]);

  const handleMarkWatched = async () => {
    try {
      await apiClient.markEpisodeWatched(episodeId);
      setIsWatched(true);
      
      // Check for new achievements with progress animation
      const progress = await apiClient.getProgress();
      const achievements = await apiClient.getAchievements();
      const newlyUnlocked = achievements.filter((a: any) => 
        a.unlocked && !progress.achievements?.includes(a.id)
      );
      
      if (newlyUnlocked.length > 0) {
        const achievement = newlyUnlocked[0];
        setNewAchievement(achievement.name);
        
        // Show progress animation
        setAchievementProgress({ name: achievement.name, progress: 0 });
        // Animate progress bar
        setTimeout(() => {
          setAchievementProgress({ name: achievement.name, progress: 100 });
        }, 100);
        
        setTimeout(() => {
          setNewAchievement(null);
          setAchievementProgress(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !episode) return;
    setAiLoading(true);
    setAiAnswer(''); // Clear previous answer
    try {
      const answer = await apiClient.askAI(episodeId, aiQuestion);
      setAiAnswer(answer);
    } catch (error: any) {
      console.error('Error asking AI:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Sorry, there was an error. Please try again.';
      setAiAnswer(`Error: ${errorMessage}. Please make sure the backend is running and Gemini API is configured.`);
    } finally {
      setAiLoading(false);
    }
  };


  // WhisperChat Enhancement Handlers
  const handleGenerateFlashcards = async () => {
    setFlashcardsLoading(true);
    try {
      const cards = await apiClient.getFlashcards(episodeId);
      setFlashcards(cards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Error generating flashcards. Please try again.');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const toggleCard = (index: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      const quizData = await apiClient.getQuiz(episodeId);
      setQuiz(quizData);
      setQuizAnswers({});
      setShowQuizResults(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
  };

  const handleCheckQuiz = async () => {
    setShowQuizResults(true);
    
    // Calculate score
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct_index) {
        correct++;
      }
    });
    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    
    // Submit score to backend for achievement tracking
    try {
      const result = await apiClient.submitQuizScore(episodeId, score);
      if (result.new_achievements && result.new_achievements.length > 0) {
        // Show achievement progress animation
        setTimeout(() => {
          setAchievementProgress({ name: 'Action Hero', progress: 0 });
          setTimeout(() => {
            setAchievementProgress({ name: 'Action Hero', progress: 100 });
          }, 100);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting quiz score:', error);
    }
    
    // Show completion animation
    setShowQuizCompletion(true);
    
    // Hide completion animation after 3 seconds
    setTimeout(() => {
      setShowQuizCompletion(false);
    }, 3000);
  };

  const handleGenerateSlides = async () => {
    setSlidesLoading(true);
    try {
      const slidesData = await apiClient.getSlides(episodeId);
      setSlides(slidesData);
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Error generating slides:', error);
      alert('Error generating slides. Please try again.');
    } finally {
      setSlidesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Episode not found</div>
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

      {/* Episode Content */}
      <div className="pt-24 px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Episode Header */}
          <div className="mb-8">
            <Link
              href={`/course/${episode.course_id}`}
              className="text-netflix-red hover:underline mb-4 inline-block flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course
            </Link>
            
            {/* Fake Video Player Box */}
            <div className="mb-6 aspect-video bg-gradient-to-br from-netflix-red/20 via-netflix-black to-netflix-black rounded-xl overflow-hidden border border-gray-800 relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-netflix-red rounded-full p-6 mb-4 inline-block group-hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-16 h-16 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Episode Preview</p>
                  <p className="text-gray-500 text-xs mt-1">Video generation coming soon</p>
                </div>
              </div>
              {/* Subtle animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 text-white">{episode.title}</h1>
                <p className="text-xl text-gray-300 leading-relaxed">{episode.summary}</p>
              </div>
              {!isWatched && (
                <button
                  onClick={handleMarkWatched}
                  className="ml-6 px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Mark as Watched
                </button>
              )}
              {isWatched && (
                <div className="ml-6 px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Watched
                </div>
              )}
            </div>
          </div>

          {/* Achievement Notification with Progress */}
          {newAchievement && (
            <div className="fixed top-20 right-8 bg-gradient-to-br from-netflix-dark via-netflix-black to-netflix-dark text-white p-6 rounded-lg shadow-2xl z-50 animate-fade-in border-2 border-netflix-red/50 backdrop-blur-sm overflow-hidden">
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              }}></div>
              
              {/* Spotlight effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-netflix-red/20 rounded-full blur-2xl"></div>
              
              <div className="relative flex items-center gap-4">
                {/* Achievement icon */}
                <div className="relative">
                  <div className="w-14 h-14 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10 animate-pulse">
                    <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-netflix-red rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-1" style={{ 
                    textShadow: '0 0 10px rgba(229, 9, 20, 0.5)'
                  }}>
                    Achievement Unlocked
                  </h3>
                  <p className="text-base text-gray-300 font-medium mb-2">{newAchievement}</p>
                  {achievementProgress && (
                    <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-700 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-netflix-red to-red-600 h-2 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${achievementProgress.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Key Points */}
          <div className="bg-netflix-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Key Points</h2>
            <ul className="list-disc list-inside space-y-2">
              {episode.key_points.map((point, idx) => (
                <li key={idx} className="text-gray-300">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Episode Content / Transcript */}
          {episode.transcript && (
            <div className="bg-netflix-dark rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Episode Content</h2>
              <div className="text-gray-300 leading-relaxed">
                {episode.transcript.split(/\. /).reduce((acc: any[], sentence: string, idx: number) => {
                  const trimmed = sentence.trim();
                  if (!trimmed) return acc;
                  
                  const sentenceWithPeriod = trimmed.endsWith('.') ? trimmed : trimmed + '.';
                  
                  // Group every 3-4 sentences into paragraphs
                  const paragraphIndex = Math.floor(idx / 3);
                  if (!acc[paragraphIndex]) {
                    acc[paragraphIndex] = [];
                  }
                  acc[paragraphIndex].push(sentenceWithPeriod);
                  return acc;
                }, []).map((paragraph: string[], pIdx: number) => (
                  <p key={pIdx} className="mb-4 text-base">
                    {paragraph.join(' ')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* AI Tutor Section */}
          <div className="bg-netflix-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">AI Tutor (WhisperChat)</h2>
            <p className="text-gray-400 mb-4">
              Ask any question about this episode and get instant AI-powered explanations.
            </p>
            <div className="space-y-4">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="E.g., 'Explain this like I'm 12' or 'Give me real-world examples'"
                className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-netflix-red focus:outline-none"
                rows={3}
              />
              <button
                onClick={handleAskAI}
                disabled={aiLoading || !aiQuestion.trim()}
                className="px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'Asking AI...' : 'Ask AI Tutor'}
              </button>
              {aiAnswer && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="text-white prose prose-invert max-w-none">
                    {renderMarkdown(aiAnswer)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WhisperChat Study Tools */}
          <div className="bg-netflix-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Study Tools (WhisperChat)</h2>
            <p className="text-gray-400 mb-6">
              Generate flashcards, quizzes, and presentation slides to enhance your learning.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={handleGenerateFlashcards}
                disabled={flashcardsLoading}
                className="px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {flashcardsLoading ? 'Generating...' : 'Generate Flashcards'}
              </button>
              <button
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {quizLoading ? 'Generating...' : 'Generate Quiz'}
              </button>
              <button
                onClick={handleGenerateSlides}
                disabled={slidesLoading}
                className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {slidesLoading ? 'Generating...' : 'Generate Slides'}
              </button>
            </div>

            {/* Flashcards Display */}
            {flashcards.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Flashcards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcards.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => toggleCard(index)}
                      className="relative h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg p-6 cursor-pointer transform transition-all hover:scale-105 border border-purple-500/30"
                    >
                      <div className={`absolute inset-0 p-6 flex items-center justify-center transition-transform duration-300 ${flippedCards.has(index) ? 'rotate-y-180 opacity-0' : 'opacity-100'}`}>
                        <p className="text-white font-semibold text-lg text-center">{card.front}</p>
                      </div>
                      <div className={`absolute inset-0 p-6 flex items-center justify-center transition-transform duration-300 ${flippedCards.has(index) ? 'opacity-100' : 'rotate-y-180 opacity-0'}`}>
                        <p className="text-gray-200 text-center">{card.back}</p>
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">Click to flip</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Display */}
            {quiz.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Quiz</h3>
                
                {/* Quiz Completion Animation */}
                {showQuizCompletion && (
                  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
                    <div className="relative bg-gradient-to-br from-netflix-dark via-netflix-black to-netflix-dark rounded-2xl p-12 max-w-lg w-full mx-4 border-2 border-netflix-red/50 shadow-2xl text-center overflow-hidden">
                      {/* Cinematic film grain effect */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                      }}></div>
                      
                      {/* Spotlight effect */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-netflix-red/20 rounded-full blur-3xl"></div>
                      
                      <div className="relative z-10">
                        {/* Film strip icon */}
                        <div className="mb-6 flex justify-center">
                          <div className="relative">
                            <div className="w-24 h-24 border-4 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-dark/50 backdrop-blur-sm">
                              <svg className="w-12 h-12 text-netflix-red" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 4h2v16h-2V4zM2 4h2v16H2V4zm5 0h10v16H7V4z"/>
                              </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-netflix-red rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        
                        <h3 className="text-4xl font-bold text-white mb-4 tracking-wide uppercase" style={{ 
                          textShadow: '0 0 20px rgba(229, 9, 20, 0.5)',
                          letterSpacing: '0.1em'
                        }}>
                          Quiz Complete
                        </h3>
                        
                        {quizScore !== null && (
                          <div className="mb-8">
                            <div className="text-7xl font-black text-netflix-red mb-3" style={{
                              textShadow: '0 0 30px rgba(229, 9, 20, 0.8)',
                              fontFamily: 'monospace'
                            }}>
                              {quizScore}%
                            </div>
                            <div className="text-lg text-gray-300 font-medium tracking-wide">
                              {quizScore === 100 ? "PERFECT SCORE" : 
                               quizScore >= 80 ? "EXCELLENT" : 
                               quizScore >= 60 ? "GOOD EFFORT" : 
                               "KEEP LEARNING"}
                            </div>
                          </div>
                        )}
                        
                        {/* Cinematic progress bar */}
                        <div className="relative w-full bg-gray-900/50 rounded-full h-4 mb-6 overflow-hidden border border-gray-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                          <div 
                            className="bg-gradient-to-r from-netflix-red to-red-600 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                            style={{ width: `${quizScore || 0}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm uppercase tracking-wider">Review your answers below</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievement Progress Animation */}
                {achievementProgress && (
                  <div className="fixed top-20 right-8 bg-gradient-to-br from-netflix-dark via-netflix-black to-netflix-dark text-white p-6 rounded-lg shadow-2xl z-50 animate-fade-in border-2 border-netflix-red/50 backdrop-blur-sm overflow-hidden">
                    {/* Film grain overlay */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    }}></div>
                    
                    <div className="relative flex items-center gap-4">
                      {/* Trophy icon */}
                      <div className="relative">
                        <div className="w-14 h-14 border-2 border-netflix-red rounded-lg flex items-center justify-center bg-netflix-red/10">
                          <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-netflix-red rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-1" style={{ 
                          textShadow: '0 0 10px rgba(229, 9, 20, 0.5)'
                        }}>
                          Achievement Unlocked
                        </h3>
                        <p className="text-base text-gray-300 font-medium mb-2">{achievementProgress.name}</p>
                        <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-700 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-netflix-red to-red-600 h-2 rounded-full transition-all duration-1000 relative"
                            style={{ width: `${achievementProgress.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Display */}
                {showQuizResults && quizScore !== null && (
                  <div className="mb-6 bg-gradient-to-br from-netflix-dark/80 to-netflix-black/80 rounded-lg p-6 border border-netflix-red/30 backdrop-blur-sm relative overflow-hidden">
                    {/* Subtle film grain */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    }}></div>
                    
                    <div className="relative flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Your Score</h4>
                        <div className="flex items-baseline gap-4">
                          <div className="text-6xl font-black text-netflix-red" style={{
                            textShadow: '0 0 20px rgba(229, 9, 20, 0.6)',
                            fontFamily: 'monospace'
                          }}>
                            {quizScore}%
                          </div>
                          <div className="text-gray-300 font-medium">
                            {quiz.filter((q, idx) => quizAnswers[idx] === q.correct_index).length} / {quiz.length} Correct
                          </div>
                        </div>
                      </div>
                      {/* Status badge */}
                      <div className={`px-4 py-2 rounded-lg border-2 ${
                        quizScore === 100 ? 'border-netflix-red bg-netflix-red/20' :
                        quizScore >= 80 ? 'border-green-500 bg-green-500/20' :
                        quizScore >= 60 ? 'border-yellow-500 bg-yellow-500/20' :
                        'border-gray-500 bg-gray-500/20'
                      }`}>
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {quizScore === 100 ? 'Perfect' :
                           quizScore >= 80 ? 'Excellent' :
                           quizScore >= 60 ? 'Good' : 'Practice'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-800/50 rounded-full h-3 border border-gray-700 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-netflix-red to-red-600 h-3 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${quizScore}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                      <p className="text-white font-semibold mb-4">{qIndex + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option: string, optIndex: number) => {
                          const isSelected = quizAnswers[qIndex] === optIndex;
                          const isCorrect = optIndex === q.correct_index;
                          const showResult = showQuizResults;
                          return (
                            <button
                              key={optIndex}
                              onClick={() => !showResult && handleQuizAnswer(qIndex, optIndex)}
                              disabled={showResult}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                showResult
                                  ? isCorrect
                                    ? 'bg-green-600/30 border-green-500'
                                    : isSelected
                                    ? 'bg-red-600/30 border-red-500'
                                    : 'bg-gray-800 border-gray-700'
                                  : isSelected
                                  ? 'bg-blue-600/30 border-blue-500'
                                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <span className="text-white">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </span>
                              {showResult && isCorrect && (
                                <span className="ml-2 text-green-400">✓ Correct</span>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <span className="ml-2 text-red-400">✗ Your answer</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {showQuizResults && (
                        <p className="mt-4 text-gray-300 text-sm">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {!showQuizResults && (
                  <button
                    onClick={handleCheckQuiz}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Check Answers
                  </button>
                )}
              </div>
            )}

            {/* Slides Display */}
            {slides.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Presentation Slides</h3>
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 relative min-h-[400px]">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white mb-6">{slides[currentSlideIndex]?.title}</h4>
                    <ul className="space-y-3 text-left max-w-2xl mx-auto">
                      {slides[currentSlideIndex]?.bullets?.map((bullet: string, idx: number) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-3">
                          <span className="text-netflix-red mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <span className="text-gray-400">
                      {currentSlideIndex + 1} / {slides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}



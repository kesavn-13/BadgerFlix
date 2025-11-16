import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for AI operations (Gemini can be slow)
});

// Override for FormData requests - don't set Content-Type
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  episode_count?: number;
  episode_ids?: string[];
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  course_id: string;
  title: string;
  summary: string;
  key_points: string[];
  transcript?: string;
}

export interface Question {
  id: string;
  episode_id: string;
  question_text: string;
  is_anonymous: boolean;
  answer_text?: string;
}

export const apiClient = {
  // Authentication
  login: async (email: string, password: string, role: string) => {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/auth/logout', {}, { params: { token } });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await api.get('/auth/me', { params: { token } });
      return response.data;
    } catch {
      return null;
    }
  },

  // Subjects
  getSubjects: async (): Promise<string[]> => {
    const response = await api.get('/subjects');
    return response.data.subjects;
  },

  // Courses
  getCoursesBySubject: async (subject: string): Promise<Course[]> => {
    const response = await api.get(`/subject/${encodeURIComponent(subject)}/courses`);
    return response.data.courses;
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const response = await api.get(`/course/${courseId}`);
    return response.data;
  },

  // Episodes
  getEpisode: async (episodeId: string): Promise<Episode> => {
    const response = await api.get(`/episode/${episodeId}`);
    return response.data;
  },

  // AI Tutor
  askAI: async (episodeId: string, question: string): Promise<string> => {
    const response = await api.post(`/episode/${episodeId}/ask-ai`, { question }, {
      timeout: 60000, // 60 seconds for AI generation
    });
    return response.data.answer;
  },

  // Q&A
  askInstructor: async (episodeId: string, questionText: string, isAnonymous: boolean = true) => {
    const response = await api.post(`/episode/${episodeId}/ask-instructor`, {
      question_text: questionText,
      is_anonymous: isAnonymous,
    });
    return response.data;
  },

  getEpisodeQuestions: async (episodeId: string): Promise<Question[]> => {
    const response = await api.get(`/episode/${episodeId}/questions`);
    return response.data.questions;
  },

  // Instructor
  getUnansweredQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/instructor/questions');
    return response.data.questions;
  },

  answerQuestion: async (questionId: string, answerText: string) => {
    const response = await api.post(`/question/${questionId}/answer`, {
      answer_text: answerText,
    });
    return response.data;
  },

  // WhisperChat Enhancements
  getFlashcards: async (episodeId: string) => {
    const response = await api.post(`/episode/${episodeId}/flashcards`, {}, {
      timeout: 60000, // 60 seconds for AI generation
    });
    return response.data.flashcards;
  },

  getQuiz: async (episodeId: string) => {
    const response = await api.post(`/episode/${episodeId}/quiz`, {}, {
      timeout: 60000, // 60 seconds for AI generation
    });
    return response.data.quiz;
  },

  getSlides: async (episodeId: string) => {
    const response = await api.post(`/episode/${episodeId}/slides`, {}, {
      timeout: 60000, // 60 seconds for AI generation
    });
    return response.data.slides;
  },

  // Progress & Achievements
  markEpisodeWatched: async (episodeId: string) => {
    const response = await api.post(`/episode/${episodeId}/mark-watched`);
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data.achievements;
  },

  addToMyList: async (courseId: string) => {
    const response = await api.post(`/course/${courseId}/add-to-list`);
    return response.data;
  },

  removeFromMyList: async (courseId: string) => {
    const response = await api.delete(`/course/${courseId}/remove-from-list`);
    return response.data;
  },

  getContinueWatching: async () => {
    const response = await api.get('/continue-watching');
    return response.data.continue_watching;
  },

  submitQuizScore: async (episodeId: string, score: number) => {
    const response = await api.post(`/quiz/${episodeId}/submit-score`, { score });
    return response.data;
  },

  // Upload
  uploadLecture: async (file: File, title: string, subject: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subject', subject);

    // Debug: Log what we're sending
    console.log('Uploading:', { fileName: file.name, title, subject });
    console.log('FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? v.name : v]));

    try {
      // Create a new axios instance without default headers for this request
      const uploadApi = axios.create({
        baseURL: API_BASE_URL,
      });
      
      const response = await uploadApi.post('/upload-lecture', formData, {
        headers: {
          // Explicitly set Content-Type to let browser add boundary
          // Actually, don't set it - let browser handle it
        },
        // Ensure axios doesn't transform FormData
        transformRequest: [],
      });
      return response.data;
    } catch (error: any) {
      // Re-throw with better error structure
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw error;
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check if backend is running.');
      } else {
        // Something happened in setting up the request
        throw new Error(error.message || 'Error uploading file');
      }
    }
  },
};


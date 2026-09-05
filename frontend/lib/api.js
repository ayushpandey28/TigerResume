import axios from 'axios';
import { getToken, removeToken } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/sign-in') &&
        !window.location.pathname.startsWith('/sign-up')
      ) {
        window.location.href = '/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API
// ============================================================

export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', {
    name,
    email,
    password
  });

  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};


// ============================================================
// RESUME API
// ============================================================

export const uploadResumeFile = async (file) => {
  const formData = new FormData();

  formData.append('resume', file);

  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const fetchResumes = async () => {
  const response = await api.get('/resume');
  return response.data;
};

export const fetchResumeById = async (id) => {
  const response = await api.get(`/resume/${id}`);
  return response.data;
};

export const updateResumeData = async (id, data) => {
  const response = await api.put(`/resume/${id}`, data);
  return response.data;
};

export const deleteResumeById = async (id) => {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
};

export const fetchResumeVersions = async (id) => {
  const response = await api.get(`/resume/${id}/versions`);
  return response.data;
};

export const getResumeVersions = fetchResumeVersions;

export const fetchResumeVersion = async (id, version) => {
  const response = await api.get(
    `/resume/${id}/versions/${version}`
  );

  return response.data;
};

export const updateResumeDocumentModel = async (id, documentModel) => {
  const response = await api.put(`/resume/${id}/document-model`, { documentModel });
  return response.data;
};

export const getOriginalResumeUrl = (id, download = false) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${baseUrl}/resume/${id}/original${download ? '?download=true' : ''}`;
};

export const getOriginalResumeBlob = async (id) => {
  const response = await api.get(`/resume/${id}/original`, {
    responseType: 'blob'
  });
  return response.data;
};

export const generateEditedResumePdf = async (id) => {
  const response = await api.post(
    `/resume/${id}/pdf/edited`,
    {},
    {
      responseType: 'blob'
    }
  );
  return response.data;
};

// ============================================================
// ATS API
// ============================================================

export const analyzeATS = async ({
  resumeId,
  jobDescriptionId,
  jobText
}) => {
  const response = await api.post('/ats/analyze', {
    resumeId,
    jobDescriptionId,
    jobText
  });

  return response.data;
};

export const fetchATSHistory = async () => {
  const response = await api.get('/ats/history');
  return response.data;
};

export const fetchATSResult = async (id) => {
  const response = await api.get(`/ats/${id}`);
  return response.data;
};

// ============================================================
// AI RESUME ANALYSIS API
// ============================================================

export const analyzeResumeAI = async (resumeId) => {
  const response = await api.post(
    `/resume/${resumeId}/analyze`
  );

  return response.data;
};

// ============================================================
// JOB DESCRIPTION API
// ============================================================

export const createJobDescription = async (data) => {
  const response = await api.post('/jobs', data);
  return response.data;
};

export const fetchJobDescriptions = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const fetchJobDescriptionById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const updateJobDescriptionData = async (id, data) => {
  const response = await api.put(`/jobs/${id}`, data);
  return response.data;
};

export const deleteJobDescriptionById = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

export const analyzeJobDescriptionAI = async (id) => {
  const response = await api.post(
    `/jobs/${id}/analyze`
  );

  return response.data;
};

// ============================================================
// JOB MATCH API
// ============================================================

export const matchResumeToJobAPI = async ({
  resumeId,
  jobDescriptionId
}) => {
  const response = await api.post('/job-match', {
    resumeId,
    jobDescriptionId
  });

  return response.data;
};

export const fetchJobMatchHistory = async () => {
  const response = await api.get('/job-match/history');
  return response.data;
};

// ============================================================
// RESUME IMPROVEMENT API
// ============================================================

export const analyzeResumeImprovement = async ({
  resumeId,
  jobDescriptionId
}) => {
  const response = await api.post('/improvement/analyze', {
    resumeId,
    jobDescriptionId
  });

  return response.data;
};

/*
 * Apply accepted AI resume improvements.
 *
 * Backend expects:
 * {
 *   resumeId,
 *   acceptedChanges
 * }
 */
export const applyResumeImprovement = async ({
  resumeId,
  acceptedChanges
}) => {
  const response = await api.post('/improvement/apply', {
    resumeId,
    acceptedChanges
  });

  return response.data;
};

// ============================================================
// SKILL GAP API
// ============================================================

export const analyzeSkillGapAPI = async ({
  resumeId,
  jobDescriptionId
}) => {
  const response = await api.post('/skills/gap', {
    resumeId,
    jobDescriptionId
  });

  return response.data;
};

export const fetchSkillGapHistory = async () => {
  const response = await api.get('/skills/history');
  return response.data;
};

// ============================================================
// GITHUB API
// ============================================================

export const analyzeGithubAPI = async (input) => {
  const payload =
    typeof input === 'string'
      ? { username: input }
      : input;

  const response = await api.post(
    '/github/analyze',
    payload
  );

  return response.data;
};

export const fetchGithubHistory = async () => {
  const response = await api.get('/github/history');
  return response.data;
};

export const fetchGithubAnalysisById = async (id) => {
  const response = await api.get(`/github/${id}`);
  return response.data;
};

// ============================================================
// LINKEDIN API
// ============================================================

export const analyzeLinkedinAPI = async (data) => {
  const response = await api.post(
    '/linkedin/analyze',
    data
  );

  return response.data;
};

export const fetchLinkedinHistory = async () => {
  const response = await api.get('/linkedin/history');
  return response.data;
};

// ============================================================
// AI RESUME CHAT API
// ============================================================

export const sendChatMessage = async ({
  resumeId,
  jobDescriptionId,
  message
}) => {
  const response = await api.post('/chat/message', {
    resumeId,
    jobDescriptionId,
    message
  });

  return response.data;
};

export const getChatHistory = async (resumeId) => {
  const response = await api.get(`/chat/${resumeId}`);
  return response.data;
};

export const createNewChat = async (resumeId) => {
  const response = await api.post('/chat/new', {
    resumeId
  });

  return response.data;
};

export const deleteChatHistory = async (resumeId) => {
  const response = await api.delete(`/chat/${resumeId}`);
  return response.data;
};

// ============================================================
// AI JOB DESCRIPTION GENERATOR
// ============================================================

export const generateJobDescriptionAI = async (data) => {
  const response = await api.post(
    '/jobs/generate',
    data
  );

  return response.data;
};

// ============================================================
// RESUME PDF EXPORT
// ============================================================

export const generateResumePdf = async (
  resumeId,
  {
    template = 'classic',
    version,
    customization = {}
  }
) => {
  const response = await api.post(
    `/resume/${resumeId}/pdf`,
    {
      template,
      version,
      customization
    },
    {
      responseType: 'blob'
    }
  );

  return response.data;
};

// ============================================================
// DASHBOARD API
// ============================================================

export const fetchDashboardSummary = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// ============================================================
// HISTORY API
// ============================================================

export const fetchUserHistory = async (type) => {
  const url =
    type && type !== 'all'
      ? `/history?type=${type}`
      : '/history';

  const response = await api.get(url);

  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;
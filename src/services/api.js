import axios from 'axios';

// Get API host from environment variable or use default
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable if you need to handle cookies
});

// Add request interceptor for auth and user ID
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user ID to headers if available
    if (userStr) {
      const user = JSON.parse(userStr);
      config.headers['x-user-id'] = user.id;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export the getCurrentUser helper function
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not authenticated');
  }
  return JSON.parse(userStr);
};

export const getChatHistories = async () => {
  const user = getCurrentUser();
  console.log('Fetching chat histories for user:', user.id);
  const response = await api.get(`/chat/histories/${user.id}`);
  console.log('Chat histories response:', response.data);
  return response.data.sessions;
};

export const getChatHistory = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error('Invalid session ID');
  }
  
  const user = getCurrentUser();
  console.log('Fetching chat history:', { userId: user.id, sessionId });
  
  const response = await api.get(`/chat/histories/${user.id}/${sessionId}`);
  console.log('Chat history response:', response.data);
  return response.data;
};

export const deleteChatHistory = async (sessionId) => {
  const user = getCurrentUser();
  await api.delete(`/chat/histories/${user.id}/${sessionId}`);
  return { success: true };
};

export const sendChatQuery = async (userInput, headers = {}) => {
  // Transform header names to match server requirements exactly
  const transformedHeaders = {
    ...headers,  // Keep any other headers
    'X-User-Id': headers['X-User-Id'] || headers['user-id'],
    'X-Session-Id': headers['X-Session-Id'] || headers['session-id']
  };

  // Remove the old header names to prevent duplication
  delete transformedHeaders['user-id'];
  delete transformedHeaders['session-id'];

  const response = await api.post('/chat/completion', 
    { user_input: userInput },
    { headers: transformedHeaders }
  );
  return response;
};

export const getDocumentIndexLogs = async (page = 1, pageSize = 10, search = '') => {
  const response = await api.get('/embedding/docs', {
    params: { page, page_size: pageSize, search }
  });
  return response.data;
};

export const uploadDocument = async (file, sourceType, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/embedding/docs/upload', formData, {
    params: { source_type: sourceType },
    headers: {
      'user-id': userId,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteDocumentIndexLog = async (logId) => {
  await api.delete(`/embedding/docs/${logId}`);
  return { success: true };
};

export const updateMessageLike = async (sessionId, requestId, liked) => {
  const user = getCurrentUser();
  await api.patch(
    `/chat/histories/${user.id}/${sessionId}/${requestId}/like`,
    { liked }
  );
}; 
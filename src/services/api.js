import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle custom headers
api.interceptors.response.use((response) => {
  // Extract custom headers from response
  const customHeaders = {
    'X-Session-Id': response.headers['x-session-id'] || response.headers['X-Session-Id'],
    'X-Request-Id': response.headers['x-request-id'] || response.headers['X-Request-Id'],
    'X-User-Id': response.headers['x-user-id'] || response.headers['X-User-Id']
  };

  console.log('Response headers:', response.headers);
  console.log('Extracted custom headers:', customHeaders);
  
  // Add custom headers to response object
  response.customHeaders = customHeaders;
  
  return response;
});

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not authenticated');
  }
  return JSON.parse(userStr);
};

export const getDocumentIndexLogs = async (page, pageSize, filters = {}) => {
  try {
    const params = {
      page,
      page_size: pageSize,
      ...filters
    };
    const response = await api.get('/embedding/docs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching document logs:', error);
    throw error;
  }
};

export const getChatHistories = async (userId) => {
  try {
    const response = await api.get(`/chat/histories/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat histories:', error);
    throw error;
  }
};

export const getChatHistory = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error('Invalid session ID');
  }
  
  const user = getCurrentUser();
  const response = await api.get(`/chat/histories/${user.id}/${sessionId}`);
  return response.data;
};

export const deleteChatHistory = async (sessionId) => {
  const user = getCurrentUser();
  await api.delete(`/chat/histories/${user.id}/${sessionId}`);
  return { success: true };
};

export const sendChatQuery = async (userInput, headers = {}) => {
  try {
    const response = await api.post('/chat/completion', 
      { user_input: userInput },
      { 
        headers: {
          ...headers,
          // Request server to expose all headers
          'Access-Control-Request-Headers': '*'
        },
        withCredentials: true
      }
    );
    return response;
  } catch (error) {
    console.error('Error in sendChatQuery:', error);
    throw error;
  }
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
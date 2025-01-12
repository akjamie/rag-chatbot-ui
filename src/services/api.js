import axios from 'axios';

// Get API URLs from environment variables
const CHAT_API_HOST = import.meta.env.VITE_CHAT_API_URL;
const DOC_LOG_API_HOST = import.meta.env.VITE_DOC_LOG_API_URL;

// Validate API URLs
if (!CHAT_API_HOST) {
  console.error('Chat API URL not configured. Please check VITE_CHAT_API_URL in .env file');
}

if (!DOC_LOG_API_HOST) {
  console.error('DOC Log API URL not configured. Please check VITE_DOC_LOG_API_URL in .env file');
}

// Chat API instance
const chatApi = axios.create({
  baseURL: CHAT_API_HOST,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Log API instance
const docLogApi = axios.create({
  baseURL: DOC_LOG_API_HOST,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add request interceptor
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.id) {
    config.headers['X-User-Id'] = user.id;
  }
  return config;
});

docLogApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.id) {
    config.headers['X-User-Id'] = user.id;
  }
  return config;
});

// Add response interceptor to handle custom headers
chatApi.interceptors.response.use((response) => {
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
docLogApi.interceptors.response.use((response) => {
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
    return null;
  }
  return JSON.parse(userStr);
};

export const getDocumentIndexLogs = async (page, pageSize, filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {
        items: [],
        total: 0
      };
    }

    const { dateRange, ...otherFilters } = filters;
    
    // Handle date range conversion from local to UTC
    let fromDate, toDate;
    if (dateRange?.start) {
      fromDate = new Date(dateRange.start);
      fromDate.setHours(0, 0, 0, 0);
    }
    
    if (dateRange?.end) {
      toDate = new Date(dateRange.end);
      toDate.setDate(toDate.getDate() + 1);
      toDate.setHours(0, 0, 0, 0);
      toDate = new Date(toDate.getTime() - 1);
    }

    // Create params object with correct parameter names
    const params = {
      page,
      page_size: pageSize
    };

    // Only add filters if they have valid values
    if (otherFilters.source?.trim()) {
      params.source = otherFilters.source;
    }

    if (otherFilters.sourceType && otherFilters.sourceType !== 'all') {
      params.source_type = otherFilters.sourceType;
    }

    if (otherFilters.status && otherFilters.status !== 'all') {
      params.status = otherFilters.status;
    }

    if (otherFilters.createdBy?.trim()) {
      params.created_by = otherFilters.createdBy;
    }

    // Always add date range if present
    if (dateRange?.start) {
      params.from_date = fromDate.toISOString();
    }

    if (dateRange?.end) {
      params.to_date = toDate.toISOString();
    }

    console.log('Request params:', params); // Add logging to debug

    const response = await docLogApi.get('/embedding/docs', { 
      params,
      headers: {
        'X-User-Id': user.id
      }
    });

    // Transform UTC dates to local timezone in the response
    const transformedData = response.data.map(doc => ({
      ...doc,
      created_at: new Date(doc.created_at).toLocaleString(),
      modified_at: new Date(doc.modified_at).toLocaleString()
    }));

    return {
      items: transformedData,
      total: response.data.length
    };
  } catch (error) {
    console.error('Error fetching document logs:', error);
    throw error;
  }
};

export const getChatHistories = async (userId) => {
  try {
    const response = await chatApi.get(`/chat/histories/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat histories:', error);
    throw error;
  }
};

export const getChatHistory = async (sessionId) => {
  try {
    const response = await chatApi.get(`/chat/histories/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const deleteChatHistory = async (sessionId) => {
  try {
    const response = await chatApi.delete(`/chat/histories/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    throw error;
  }
};

export const sendChatQuery = async (message, headers = {}) => {
  try {
    const response = await chatApi.post('/chat/query', {
      message: message
    }, { headers });
    return response;
  } catch (error) {
    console.error('Error sending chat query:', error);
    throw error;
  }
};

export const uploadDocument = async (file, category, sourceType, url, userId) => {
  const formData = new FormData();
  formData.append('category', category);
  
  if (category === 'file' && file) {
    formData.append('file', file);
  } else if ((category === 'web_page' || category === 'confluence') && url) {
    formData.append('url', url);
  }
  
  const response = await docLogApi.post('/embedding/docs/upload', formData, {
    headers: {
      'X-User-Id': userId,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteDocumentIndexLog = async (logId) => {
  const user = getCurrentUser();
  await docLogApi.delete(`/embedding/docs/${logId}`, {
    headers: {
      'X-User-Id': user.id
    }
  });
  return { success: true };
};

export const updateMessageLike = async (sessionId, messageId, liked) => {
  try {
    const response = await docLogApi.post(`/chat/messages/${sessionId}/${messageId}/like`, {
      liked: liked
    });
    return response.data;
  } catch (error) {
    console.error('Error updating message like:', error);
    throw error;
  }
}; 
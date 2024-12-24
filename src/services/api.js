// Mock data with user_id
const mockData = {
  user_001: {
    histories: [
      { 
        user_id: 'user_001',
        session_id: 'session_001',
        title: 'First Chat'
      },
      { 
        user_id: 'user_001',
        session_id: 'session_002',
        title: 'Second Chat'
      }
    ],
    messages: {
      'session_001': [
        { request_id: 'req_001', user_input: 'Hello', response: 'Hi there!' },
        { request_id: 'req_002', user_input: 'How are you?', response: 'I am doing well!' }
      ],
      'session_002': [
        { request_id: 'req_003', user_input: 'What is AI?', response: 'AI is...' }
      ]
    }
  }
};

// Mock document index logs
const mockIndexLogs = [
  {
    id: 'log_001',
    filename: 'document1.pdf',
    status: 'completed',
    timestamp: '2024-02-24T10:00:00Z'
  },
  {
    id: 'log_002',
    filename: 'document2.pdf',
    status: 'processing',
    timestamp: '2024-02-24T10:30:00Z'
  }
];

// Make sure all exports are at the top level
export const getChatHistories = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData[userId]?.histories || [];
};

export const getChatHistory = async (userId, sessionId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    user_id: userId,
    session_id: sessionId,
    messages: mockData[userId]?.messages[sessionId] || []
  };
};

export const deleteChatHistory = async (userId, sessionId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (mockData[userId]) {
    mockData[userId].histories = mockData[userId].histories.filter(
      h => h.session_id !== sessionId
    );
    delete mockData[userId].messages[sessionId];
  }
  return { success: true };
};

export const sendChatQuery = async ({ headers, user_input }) => {
  const { 'user-id': userId, 'session-id': sessionId } = headers;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    response: `Mock response to: ${user_input}`
  };
};

// Add the missing document index log functions
export const getDocumentIndexLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockIndexLogs;
};

export const deleteDocumentIndexLog = async (logId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockIndexLogs.findIndex(log => log.id === logId);
  if (index !== -1) {
    mockIndexLogs.splice(index, 1);
  }
  return { success: true };
}; 
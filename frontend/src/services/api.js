import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost';

const summaryServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8082/api`
});

const voteServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8083/api`
});

const commentServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8084/api`
});

const savedServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8085/api`
});

const userServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8081/api`
});

const recommendationServiceClient = axios.create({
  baseURL: `${API_BASE_URL}:8086/api`
});

export const summaryService = {
  getAllSummaries: (page = 0, size = 20) => 
    summaryServiceClient.get(`/summaries?page=${page}&size=${size}`),
  
  getTopSummaries: (page = 0, size = 20) => 
    summaryServiceClient.get(`/summaries/top?page=${page}&size=${size}`),
  
  getSummaryById: (id) => 
    summaryServiceClient.get(`/summaries/${id}`),
  
  createSummary: (summary) => 
    summaryServiceClient.post('/summaries', summary),
  
  getSummariesByTags: (tags, page = 0, size = 20) => 
    summaryServiceClient.get(`/summaries/tags?tags=${tags.join(',')}&page=${page}&size=${size}`),
  
  getTrendingDigest: () => 
    summaryServiceClient.get('/summaries/trending'),

  getSummariesByUserId: (userId, page = 0, size = 20) =>
    summaryServiceClient.get(`/summaries/user/${userId}?page=${page}&size=${size}`),

  deleteSummary: (id, userId) =>
    summaryServiceClient.delete(`/summaries/${id}?userId=${userId}`)
};

export const voteService = {
  castVote: (userId, summaryId, value) => 
    voteServiceClient.post('/votes', { userId, summaryId, value }),
  
  getVote: (userId, summaryId) => 
    voteServiceClient.get(`/votes?userId=${userId}&summaryId=${summaryId}`),
  
  getVoteCount: (summaryId) => 
    voteServiceClient.get(`/votes/count/${summaryId}`),
  
  removeVote: (userId, summaryId) => 
    voteServiceClient.delete(`/votes?userId=${userId}&summaryId=${summaryId}`)
};

export const commentService = {
  createComment: (comment) => 
    commentServiceClient.post('/comments', comment),
  
  getCommentsBySummary: (summaryId, viewerId, page = 0, size = 20) => {
    const viewerParam = viewerId ? `&viewerId=${viewerId}` : '';
    return commentServiceClient.get(`/comments/summary/${summaryId}?page=${page}&size=${size}${viewerParam}`);
  },
  
  getCommentCount: (summaryId) => 
    commentServiceClient.get(`/comments/count/${summaryId}`),
  
  deleteComment: (id, userId) => 
    commentServiceClient.delete(`/comments/${id}?userId=${userId}`),

  likeComment: (id, userId) =>
    commentServiceClient.post(`/comments/${id}/likes?userId=${userId}`),

  unlikeComment: (id, userId) =>
    commentServiceClient.delete(`/comments/${id}/likes?userId=${userId}`),

  reportComment: (id, userId, reason) =>
    commentServiceClient.post(`/comments/${id}/report?userId=${userId}&reason=${encodeURIComponent(reason)}`),

  hideComment: (id, moderatorId) =>
    commentServiceClient.post(`/comments/${id}/moderate/hide?userId=${moderatorId}`),

  restoreComment: (id, moderatorId) =>
    commentServiceClient.post(`/comments/${id}/moderate/restore?userId=${moderatorId}`)
};

export const savedService = {
  saveSummary: (userId, summaryId) => 
    savedServiceClient.post('/saved', { userId, summaryId }),
  
  getSavedSummaries: (userId, page = 0, size = 20) => 
    savedServiceClient.get(`/saved/user/${userId}?page=${page}&size=${size}`),
  
  isSaved: (userId, summaryId) => 
    savedServiceClient.get(`/saved/check?userId=${userId}&summaryId=${summaryId}`),
  
  unsaveSummary: (userId, summaryId) => 
    savedServiceClient.delete(`/saved?userId=${userId}&summaryId=${summaryId}`)
};

export const notificationService = {
  getNotifications: (userId, page = 0, size = 20) =>
    commentServiceClient.get(`/notifications/user/${userId}?page=${page}&size=${size}`),

  getUnreadCount: (userId) =>
    commentServiceClient.get(`/notifications/user/${userId}/unread-count`),

  markRead: (notificationId, userId) =>
    commentServiceClient.post(`/notifications/${notificationId}/read?userId=${userId}`),

  markAllRead: (userId) =>
    commentServiceClient.post(`/notifications/user/${userId}/read-all`)
};

export const userService = {
  createUser: (user) => 
    userServiceClient.post('/users', user),
  
  getUserById: (id) => 
    userServiceClient.get(`/users/${id}`),
  
  getUserByUsername: (username) => 
    userServiceClient.get(`/users/username/${username}`)
};

export const authService = {
  signup: (payload) =>
    userServiceClient.post('/auth/signup', payload),

  login: (payload) =>
    userServiceClient.post('/auth/login', payload),

  requestPasswordReset: (payload) =>
    userServiceClient.post('/auth/password/reset-request', payload),

  resetPassword: (payload) =>
    userServiceClient.post('/auth/password/reset-confirm', payload),

  getCurrentUser: (token) =>
    userServiceClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
};

export const recommendationService = {
  getRecommendations: (userId, limit = 20) =>
    recommendationServiceClient.get(`/recommendations/user/${userId}?limit=${limit}`),

  trackBehavior: (userId, summaryId, behaviorType) =>
    recommendationServiceClient.post(`/recommendations/track?userId=${userId}&summaryId=${summaryId}&behaviorType=${behaviorType}`),

  removeVoteBehaviors: (userId, summaryId) =>
    recommendationServiceClient.delete(`/recommendations/track?userId=${userId}&summaryId=${summaryId}`),

  submitFeedback: (userId, summaryId, feedbackType) =>
    recommendationServiceClient.post('/recommendations/feedback', {
      userId,
      summaryId,
      feedbackType
    }),

  getUserPreferences: (userId) =>
    recommendationServiceClient.get(`/recommendations/preferences/${userId}`),

  updatePreferences: (userId) =>
    recommendationServiceClient.post(`/recommendations/preferences/${userId}/update`)
};
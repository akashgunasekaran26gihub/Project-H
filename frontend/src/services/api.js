/**
 * API Client with Offline Synchronization Queue
 */

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

// Helper for auth headers
const getHeaders = () => {
  const token = localStorage.getItem('habit_tracker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper
async function request(endpoint, options = {}) {
  const config = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    if (res.status === 401) {
      // If unauthorized, clean up token
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('habit_tracker_token');
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Offline Queue Management
const QUEUE_KEY = 'habit_tracker_offline_queue';

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (action) => {
  const queue = getOfflineQueue();
  // Avoid duplicate action for same habit and date
  const filtered = queue.filter(item => !(item.habitId === action.habitId && item.date === action.date));
  filtered.push(action);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  return filtered.length;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const syncOfflineActions = async () => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0 };

  let successCount = 0;
  for (const item of queue) {
    try {
      await request('/completions/toggle', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      successCount++;
    } catch (e) {
      console.warn('Failed syncing offline action:', item, e);
    }
  }

  clearOfflineQueue();
  return { synced: successCount };
};

export const api = {
  // Auth
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () =>
    request('/auth/me'),

  // Dashboard
  getDashboard: (year, month) =>
    request(`/dashboard?year=${year}&month=${month}`),

  // Habits
  getHabits: (includeArchived = false) =>
    request(`/habits?includeArchived=${includeArchived}`),
  createHabit: (habitData) =>
    request('/habits', { method: 'POST', body: JSON.stringify(habitData) }),
  updateHabit: (id, habitData) =>
    request(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(habitData) }),
  deleteHabit: (id) =>
    request(`/habits/${id}`, { method: 'DELETE' }),
  toggleArchive: (id) =>
    request(`/habits/${id}/archive`, { method: 'PATCH' }),
  reorderHabits: (habitIds) =>
    request('/habits/reorder', { method: 'PUT', body: JSON.stringify({ habitIds }) }),

  // Completions
  toggleCompletion: async (payload) => {
    // If offline, store locally and return optimistic response
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineAction(payload);
      return { ...payload, offlineQueued: true };
    }
    return request('/completions/toggle', { method: 'POST', body: JSON.stringify(payload) });
  },

  // Analytics
  getLifetime: () =>
    request('/analytics/lifetime'),
  getTrends: (year, month) =>
    request(`/analytics/trends?year=${year}&month=${month}`),

  // AI
  parseHabitPrompt: (prompt) =>
    request('/ai/habit-parser', { method: 'POST', body: JSON.stringify({ prompt }) }),
  getDailySummary: () =>
    request('/ai/daily-summary'),
  getWeeklySummary: () =>
    request('/ai/weekly-summary'),
  getAIInsights: () =>
    request('/ai/insights'),
  askAssistant: (query, conversationId) =>
    request('/ai/chat', { method: 'POST', body: JSON.stringify({ query, conversationId }) }),

  // Expenses
  getExpenseSummary: () =>
    request('/expenses/summary'),
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const queryString = query.toString();
    return request(`/expenses${queryString ? `?${queryString}` : ''}`);
  },
  addExpense: (expenseData) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(expenseData) }),
  updateExpense: (id, expenseData) =>
    request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expenseData) }),
  deleteExpense: (id) =>
    request(`/expenses/${id}`, { method: 'DELETE' }),

  // User Profile & Settings
  getProfile: () =>
    request('/user/profile'),
  updateProfile: (profileData) =>
    request('/user/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (currentPassword, newPassword) =>
    request('/user/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  deleteAccount: () =>
    request('/user/account', { method: 'DELETE' }),

  // Subscription & SaaS Billing
  getSubscription: () =>
    request('/billing/subscription'),
  createCheckoutSession: (planId, interval) =>
    request('/billing/create-checkout-session', { method: 'POST', body: JSON.stringify({ planId, interval }) }),
  cancelSubscription: () =>
    request('/billing/cancel-subscription', { method: 'POST' }),
};

const BASE_URL = '';  // Empty string because proxy handles it

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// Dashboard
export const getDashboardStats = () => request('/api/dashboard/stats');

// Alerts
export const getAlerts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/alerts${query ? '?' + query : ''}`);
};
export const updateAlertStatus = (alertId, status) =>
  request(`/api/alerts/${alertId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

// Accounts
export const getAccounts = () => request('/api/accounts');
export const getAccountById = (accountId) => request(`/api/accounts/${accountId}`);
export const updateAccountStatus = (accountId, status) =>
  request(`/api/accounts/${accountId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

// Transactions
export const getTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/transactions${query ? '?' + query : ''}`);
};

// Login events
export const getLoginEvents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/login_events${query ? '?' + query : ''}`);
};

// Kill chain
export const getKillChain = () => request('/api/killchain/compute');

// ML scoring
export const getMLScore = (accountId) => 
  request(`/api/ml/score/${accountId}`);

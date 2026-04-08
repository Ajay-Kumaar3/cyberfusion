const API_BASE = process.env.REACT_APP_API_URL || "";
const BASE = `${API_BASE}/api`;

// Helper
const get = (url) => fetch(BASE + url).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
const post = (url, body) =>
    fetch(BASE + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
const patch = (url, body) =>
    fetch(BASE + url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });

// ── Dashboard ────────────────────────────────────────────────────────────────
export const fetchDashboardSummary = () => get("/dashboard/summary");

// ── Accounts ─────────────────────────────────────────────────────────────────
export const fetchAccounts = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/accounts/${q ? "?" + q : ""}`);
};
export const fetchAccount = (id) => get(`/accounts/${id}`);

// ── Login Events ─────────────────────────────────────────────────────────────
export const fetchLogins = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/logins/${q ? "?" + q : ""}`);
};
export const createLoginEvent = (payload) => post("/logins/", payload);

// ── Transactions ──────────────────────────────────────────────────────────────
export const fetchTransactions = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/transactions/${q ? "?" + q : ""}`);
};
export const createTransaction = (payload) => post("/transactions/", payload);

// ── Alerts ────────────────────────────────────────────────────────────────────
export const fetchAlerts = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/alerts/${q ? "?" + q : ""}`);
};
export const updateAlertStatus = (id, status) => patch(`/alerts/${id}`, { status });
export const explainAlert = (id) => post(`/alerts/${id}/explain`, {});

// ── SAR Generator ─────────────────────────────────────────────────────────────
export const generateSAR = (accountId) => post("/sar/generate", { account_id: accountId });

// ── Kill Chain ────────────────────────────────────────────────────────────────
export const getKillChain = () => get("/killchain/compute");

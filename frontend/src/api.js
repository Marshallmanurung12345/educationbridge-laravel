const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.message ||
      (body.errors ? Object.values(body.errors).flat().join(" ") : null) ||
      `Request gagal (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const authApi = {
  register: (data) =>
    request(`/register`, { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    request(`/login`, { method: "POST", body: JSON.stringify(data) }),
  logout: () => request(`/logout`, { method: "POST" }),
  me: () => request(`/me`),
};

export const api = {
  listCampaigns: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/campaigns${qs ? `?${qs}` : ""}`);
  },
  getCampaign: (id) => request(`/campaigns/${id}`),
  createCampaign: (data) =>
    request(`/campaigns`, { method: "POST", body: JSON.stringify(data) }),
  updateCampaign: (id, data) =>
    request(`/campaigns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: "DELETE" }),
  match: (focusTags = []) =>
    request(`/match?focus=${encodeURIComponent(focusTags.join(","))}`),
  listDonations: (id) => request(`/campaigns/${id}/donations`),
  createDonation: (id, data) =>
    request(`/campaigns/${id}/donations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listReports: (id) => request(`/campaigns/${id}/reports`),
  createReport: (id, data) =>
    request(`/campaigns/${id}/reports`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  stats: () => request(`/stats`),
};

export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

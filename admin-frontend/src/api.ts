const TOKEN_KEY = 'admin-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function doRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/admin/login';
    throw new Error('未授权');
  }

  let data: Record<string, unknown> = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `请求失败 (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    return await doRequest<T>(url, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('无法连接后端服务，请确认 API 已启动');
    }
    throw error;
  }
}

export const api = {
  login: (username: string, password: string) =>
    request<{ accessToken: string; admin: { id: string; username: string; role: string } }>(
      '/api/admin/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    ),

  getDashboard: () => request<import('./types').DashboardStats>('/api/admin/dashboard'),

  getUsers: (keyword?: string) =>
    request<import('./types').AdminUser[]>(
      `/api/admin/users${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`,
    ),

  updateUser: (id: string, data: { nickname?: string; city?: string; bio?: string }) =>
    request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  adjustPoints: (id: string, delta: number, reason?: string) =>
    request(`/api/admin/users/${id}/points`, {
      method: 'POST',
      body: JSON.stringify({ delta, reason }),
    }),

  deleteUser: (id: string) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' }),

  getStations: () => request<import('./types').Station[]>('/api/admin/stations'),

  createStation: (data: Record<string, unknown>) =>
    request('/api/admin/stations', { method: 'POST', body: JSON.stringify(data) }),

  updateStation: (id: number, data: Record<string, unknown>) =>
    request(`/api/admin/stations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteStation: (id: number) =>
    request(`/api/admin/stations/${id}`, { method: 'DELETE' }),

  getPlants: (params?: { keyword?: string; listStatus?: string; stationId?: number }) => {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.listStatus) query.set('listStatus', params.listStatus);
    if (params?.stationId) query.set('stationId', String(params.stationId));
    const qs = query.toString();
    return request<import('./types').Plant[]>(`/api/admin/plants${qs ? `?${qs}` : ''}`);
  },

  updatePlant: (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/plants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deletePlant: (id: string) =>
    request(`/api/admin/plants/${id}`, { method: 'DELETE' }),

  getStationQrUrl: (stationId: number, size = 320) =>
    `/api/qr/station/${stationId}?size=${size}`,

  getStationQrPayload: (stationId: number) => `plantwander://station/${stationId}`,

  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = getToken();
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    let data: Record<string, unknown> = {};
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      const message =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        `上传失败 (${response.status})`;
      throw new Error(message);
    }

    return data as { url: string; filename: string };
  },
};

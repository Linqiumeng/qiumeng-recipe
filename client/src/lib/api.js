async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? `请求失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// 登录状态变化时广播，让顶栏等处更新
export const AUTH_EVENT = 'auth-change';

// 列表缓存：在首页和详情之间来回切换时不重复请求；后台增删改后清空
let listCache = null;

export const api = {
  listRecipes() {
    listCache ??= request('/recipes').catch((err) => {
      listCache = null;
      throw err;
    });
    return listCache;
  },
  getRecipe: (slug) => request(`/recipes/${encodeURIComponent(slug)}`),
  async createRecipe(data) {
    listCache = null;
    return request('/recipes', { method: 'POST', body: data });
  },
  async updateRecipe(id, data) {
    listCache = null;
    return request(`/recipes/${id}`, { method: 'PUT', body: data });
  },
  async deleteRecipe(id) {
    listCache = null;
    return request(`/recipes/${id}`, { method: 'DELETE' });
  },

  me: () => request('/auth/me'),
  async login(password) {
    await request('/auth/login', { method: 'POST', body: { password } });
    window.dispatchEvent(new Event(AUTH_EVENT));
  },
  async logout() {
    await request('/auth/logout', { method: 'POST' });
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  async uploadImage(file) {
    const sig = await request('/upload/signature');
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('folder', sig.folder);
    form.append('signature', sig.signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? '图片上传失败');
    return data.secure_url;
  },
};

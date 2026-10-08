import { useEffect, useState } from 'react';
import { api, AUTH_EVENT } from './api.js';

// 当前访客是否已登录后台；登录、退出后自动更新
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = () => api.me().then((r) => setIsAdmin(r.admin)).catch(() => setIsAdmin(false));
    check();
    window.addEventListener(AUTH_EVENT, check);
    return () => window.removeEventListener(AUTH_EVENT, check);
  }, []);

  return isAdmin;
}

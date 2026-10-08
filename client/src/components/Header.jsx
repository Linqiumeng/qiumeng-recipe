import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SITE_SUBTITLE, SITE_TITLE } from '../config.js';
import { useIsAdmin } from '../lib/useIsAdmin.js';

// 隐藏的后台入口：2 秒内连续点 5 次标题
const SECRET_TAPS = 5;
const SECRET_WINDOW_MS = 2000;

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = useIsAdmin();
  const taps = useRef([]);

  const handleTitleClick = (e) => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < SECRET_WINDOW_MS), now];
    if (taps.current.length >= SECRET_TAPS) {
      e.preventDefault();
      taps.current = [];
      navigate('/admin');
    }
  };

  return (
    <header className="container site-header">
      <Link to="/" className="site-brand" onClick={handleTitleClick}>
        <span className="sun" aria-hidden="true">🍳</span>
        <span>
          <span className="site-title">{SITE_TITLE}</span>
          {pathname === '/' && <span className="site-subtitle">{SITE_SUBTITLE}</span>}
        </span>
      </Link>
      {/* 只有登录后才会出现，朋友看不到 */}
      {isAdmin && !pathname.startsWith('/admin') && (
        <Link to="/admin" className="btn btn-small">后台</Link>
      )}
    </header>
  );
}

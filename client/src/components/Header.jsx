import { Link } from 'react-router-dom';
import { SITE_TITLE } from '../config.js';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="site-title">
          🍳 {SITE_TITLE}
        </Link>
      </div>
    </header>
  );
}

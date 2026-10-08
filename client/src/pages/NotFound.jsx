import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="status">
      <p>页面不存在</p>
      <Link to="/">回到首页</Link>
    </div>
  );
}

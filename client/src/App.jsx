import { Route, Routes, useLocation } from 'react-router-dom';
import { OrderProvider } from './lib/OrderContext.jsx';
import Header from './components/Header.jsx';
import OrderDrawer from './components/OrderDrawer.jsx';
import RecipeModal from './components/RecipeModal.jsx';
import Home from './pages/Home.jsx';
import RecipePage from './pages/RecipePage.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import RecipeForm from './pages/admin/RecipeForm.jsx';
import RequireAdmin from './pages/admin/RequireAdmin.jsx';

export default function App() {
  const location = useLocation();
  // 从卡片点进来时会带上 background（来时的页面）：背景继续渲染那个页面，详情以弹窗显示。
  // 直接打开或分享的链接没有 background，就渲染成完整的详情页。
  const background = location.state?.background;
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <OrderProvider>
      <Header />
      <main className="container">
        <Routes location={background ?? location}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
          <Route path="/admin/new" element={<RequireAdmin><RecipeForm /></RequireAdmin>} />
          <Route path="/admin/edit/:slug" element={<RequireAdmin><RecipeForm /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {background && (
        <Routes>
          <Route path="/recipes/:slug" element={<RecipeModal />} />
        </Routes>
      )}

      {!isAdmin && <OrderDrawer />}
    </OrderProvider>
  );
}

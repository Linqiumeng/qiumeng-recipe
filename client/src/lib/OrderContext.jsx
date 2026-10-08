import { createContext, useContext, useEffect, useState } from 'react';

// 点菜单：只存在访客自己的浏览器里，不需要登录
const STORAGE_KEY = 'order-list';
const OrderContext = createContext(null);

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function OrderProvider({ children }) {
  const [items, setItems] = useState(loadItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 隐私模式等情况下存不了，忽略即可
    }
  }, [items]);

  const has = (slug) => items.some((i) => i.slug === slug);
  const toggle = ({ slug, title }) =>
    setItems((prev) => (prev.some((i) => i.slug === slug) ? prev.filter((i) => i.slug !== slug) : [...prev, { slug, title }]));
  const remove = (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug));
  const clear = () => setItems([]);

  return <OrderContext.Provider value={{ items, has, toggle, remove, clear }}>{children}</OrderContext.Provider>;
}

export const useOrder = () => useContext(OrderContext);

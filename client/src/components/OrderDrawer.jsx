import { useState } from 'react';
import { useOrder } from '../lib/OrderContext.jsx';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 部分微信内置浏览器不支持 clipboard API，退回到老办法
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export default function OrderDrawer() {
  const { items, remove, clear } = useOrder();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (items.length === 0 && !open) return null;

  const text = `我想吃：\n${items.map((it, i) => `${i + 1}. ${it.title}`).join('\n')}`;

  const handleCopy = async () => {
    setCopied(await copyText(text));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button type="button" className="order-fab" onClick={() => setOpen(true)}>
        📝 点菜单 <span className="badge">{items.length}</span>
      </button>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>点菜单</h2>
              <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="关闭">
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <p className="muted">还没有点菜，在卡片上点「＋ 点菜」试试。</p>
            ) : (
              <>
                <ol className="order-list">
                  {items.map((it) => (
                    <li key={it.slug}>
                      <span>{it.title}</span>
                      <button type="button" className="link-btn" onClick={() => remove(it.slug)}>
                        移除
                      </button>
                    </li>
                  ))}
                </ol>
                <pre className="order-preview">{text}</pre>
                <div className="drawer-actions">
                  <button type="button" className="btn btn-primary" onClick={handleCopy}>
                    {copied ? '✓ 已复制，去微信粘贴吧' : '复制点菜单'}
                  </button>
                  <button type="button" className="btn" onClick={clear}>
                    清空
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

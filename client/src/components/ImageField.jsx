import { useState } from 'react';
import { api } from '../lib/api.js';
import { imageUrl } from '../lib/image.js';

// 选图后直接上传到 Cloudinary；也可以手动粘贴图片链接
export default function ImageField({ value, onChange, label = '图片' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      onChange(await api.uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      {value && <img src={imageUrl(value, 'step')} alt="" className="image-preview" />}
      <div className="image-field-row">
        <label className="btn">
          {uploading ? '上传中…' : value ? '换一张' : '选择图片'}
          <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
        </label>
        {value && (
          <button type="button" className="link-btn danger" onClick={() => onChange('')}>
            移除
          </button>
        )}
      </div>
      <input
        type="url"
        placeholder="或粘贴图片链接"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

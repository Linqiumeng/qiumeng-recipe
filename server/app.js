import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import uploadRouter from './routes/upload.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/upload', uploadRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('；') });
  }
  if (err.name === 'CastError') return res.status(404).json({ error: '没有找到这道菜' });
  console.error(err);
  res.status(500).json({ error: '服务器出错了' });
});

export default app;

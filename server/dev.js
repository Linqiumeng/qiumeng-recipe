// 本地开发用的 API 服务器（线上由 api/index.js 作为 Vercel 函数运行）
import fs from 'node:fs';
import app from './app.js';
import { connectDB } from './db.js';
import Recipe from './models/Recipe.js';
import { loadSeedRecipes, seedRecipes } from './seed.js';

const PORT = 3001;

if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = 'admin';
  console.warn('⚠ 未设置 ADMIN_PASSWORD，开发环境后台密码为 admin');
}
process.env.JWT_SECRET ||= 'dev-only-secret';

// 没有配置 Atlas 时，启动一个数据持久化在 .data/db 的本地 MongoDB。
// 端口固定为 27018，这样 `npm run recipe` 命令行也能连上它。
if (!process.env.MONGODB_URI) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const dbPath = new URL('../.data/db', import.meta.url).pathname;
  fs.mkdirSync(dbPath, { recursive: true });
  console.log('未设置 MONGODB_URI，启动本地数据库（首次运行需下载 MongoDB，稍等）…');
  const mongod = await MongoMemoryServer.create({ instance: { dbPath, port: 27018, storageEngine: 'wiredTiger' } });
  process.env.MONGODB_URI = mongod.getUri('recipes');

  const shutdown = async () => {
    await mongod.stop({ doCleanup: false });
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  await connectDB();
  if ((await Recipe.estimatedDocumentCount()) === 0) {
    console.log('本地数据库为空，导入示例菜谱：');
    await seedRecipes(loadSeedRecipes());
  }
}

app.listen(PORT, () => console.log(`API 已启动：http://localhost:${PORT}/api/recipes`));

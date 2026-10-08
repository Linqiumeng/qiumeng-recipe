// 把 scripts/seed-data/recipes.json 里的菜谱导入 MONGODB_URI 指向的数据库。
// 用法：npm run seed
import mongoose from 'mongoose';
import { connectDB } from '../server/db.js';
import { loadSeedRecipes, seedRecipes } from '../server/seed.js';

if (!process.env.MONGODB_URI) {
  console.error('请先在 .env 里填写 MONGODB_URI（本地内存数据库会在 npm run dev 时自动导入，不需要运行这个脚本）');
  process.exit(1);
}

await connectDB();
const added = await seedRecipes(loadSeedRecipes());
console.log(`完成，新增 ${added} 道菜`);
await mongoose.disconnect();

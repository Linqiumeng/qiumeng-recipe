# 我的私房菜谱

MERN 个人菜谱网站：React (Vite) + Express + MongoDB，部署在 Vercel，图片存在 Cloudinary。

## 本地开发

```bash
npm install
npm run dev
```

- 打开 http://localhost:5173
- 不配置 `.env` 也能跑：会自动启动本地 MongoDB（数据存在 `.data/`），并导入 `scripts/seed-data/recipes.json` 里的示例菜
- 后台：http://localhost:5173/admin ，开发默认密码 `admin`

## 目录

```
api/index.js          Vercel 函数入口（线上所有 /api/* 请求）
server/               Express 应用：路由、模型、登录、图片签名
server/dev.js         本地开发用的 API 服务器（端口 3001）
shared/categories.js  分类和难度定义，前后端共用
client/               React 前端
scripts/seed.js       把 seed-data 导入线上数据库
```

## 导入最初的 12 道菜

1. 把照片放进 `scripts/seed-data/images/`
2. 编辑 `scripts/seed-data/recipes.json`，图片字段写 `"images/xxx.jpg"`
3. 在 `.env` 里填好 `MONGODB_URI` 和 Cloudinary 三项，运行 `npm run seed`

脚本按菜名去重，重复运行不会产生重复数据。

## 命令行管理菜谱（给 agent 用）

除了网页后台，也可以用命令行脚本 [scripts/recipe.js](scripts/recipe.js) 增删改菜谱。它直接读写数据库，不需要后台密码，适合交给 agent 操作。

| 命令 | 作用 |
|---|---|
| `npm run recipe -- list [分类]` | 列出所有菜（分类 / 菜名 / slug），可按分类筛选 |
| `npm run recipe -- show <slug>` | 输出一道菜的完整 JSON |
| `npm run recipe -- add <文件.json>` | 新增，文件里可以是一道菜，也可以是数组 |
| `npm run recipe -- update <slug> <文件.json>` | 修改，只改文件里出现的字段 |
| `npm run recipe -- delete <slug>` | 只预览要删除哪道菜，不会真的删 |
| `npm run recipe -- delete <slug> --yes` | 真正删除，无法恢复 |

### 菜谱 JSON 模板

```json
{
  "title": "可乐鸡翅",
  "category": "荤菜",
  "summary": "甜咸口，小孩最爱",
  "coverImage": "photos/ke-le-ji-chi.jpg",
  "tags": ["下饭", "快手"],
  "prepTime": 30,
  "servings": 3,
  "difficulty": "简单",
  "ingredients": [
    { "name": "鸡翅中", "amount": "10 个" },
    { "name": "可乐", "amount": "1 罐" }
  ],
  "steps": [
    { "text": "鸡翅两面划刀，冷水下锅焯水。" },
    { "text": "煎至两面金黄，倒入可乐和生抽，大火收汁。", "image": "photos/step2.jpg" }
  ],
  "tips": "收汁时要不停翻动，防止粘锅。"
}
```

- 必填：`title`、`category`、每个步骤的 `text`；其余都可以省略
- `category` 只能是：凉菜、荤菜、素菜、汤羹、主食、甜点小吃（见 [shared/categories.js](shared/categories.js)）
- `difficulty` 只能是：简单、中等、较难
- 图片可以写本地路径（相对 JSON 文件所在目录），脚本会自动上传到 Cloudinary；也可以直接写 `https://` 开头的图片链接

### 安全设计

- 先校验内容、检查所有图片都存在，再上传图片：有错误时不会留下传了一半的数据
- 同名的菜不能重复添加，要修改请用 `update`
- slug（菜的网址）创建后不可修改，`update` 里写了也会被忽略，避免分享出去的链接失效
- 删除必须加 `--yes`，不加时只显示将要删除的菜

### 连接哪个数据库

- `.env` 里设置了 `MONGODB_URI`：操作线上数据库，改动立刻出现在网站上
- 没有设置：连接 `npm run dev` 启动的本地数据库（端口 27018），需要先运行 `npm run dev`，适合先在本地试

### 让 agent 加菜的流程

1. 把照片和随手写的做法发给 agent
2. agent 整理成上面的 JSON 模板，先给我确认
3. 确认后 agent 运行 `add`；删除时先运行不带 `--yes` 的命令让我确认，再真正删除

## 部署到 Vercel

1. MongoDB Atlas 建一个免费 M0 集群，Network Access 允许 `0.0.0.0/0`，复制连接串
2. Cloudinary 注册，记下 Cloud name / API Key / API Secret
3. 代码推到 GitHub，在 Vercel 导入该仓库（设置保持默认即可，构建配置在 `vercel.json` 里）
4. 在 Vercel 项目的 Environment Variables 里填 `.env.example` 中的所有变量
5. 部署完成后访问 `/admin` 登录，开始加菜

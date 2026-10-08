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
| `npm run recipe -- preview <文件.json>` | 只校验和查重，不写数据库，输出 Markdown 预览 |
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

## agent 加菜规范

以后加菜、改菜都交给 agent 时，按这一节执行。目标是：**我只给菜名（加上任何想补充的），agent 负责整理成格式统一的菜谱，我确认后才写入网站。**

### 我可以提供什么

只有菜名就够了，下面这些都可以选择性地给：

- 分类、一句话简介
- 自己的做法、用料、小贴士（随手写的也行，比如一段语音转文字）
- 照片（封面图、步骤图）

**我给出的内容优先**：分类、简介照原样用；做法只整理措辞和格式，不改变步骤和用料。我没给的部分由 agent 按常见的家常做法补全。

### 工作流程

1. **查重**：运行 `npm run recipe -- list`，确认网站上没有同名的菜。
2. **写草稿**：整理成 JSON，存到 `scripts/drafts/<日期>-<简述>.json`（这个文件夹不进 git）。照片放在 `scripts/drafts/images/`，JSON 里写相对路径 `images/xxx.jpg`。
3. **生成预览**：

   ```bash
   npm run recipe -- preview scripts/drafts/xxx.json > scripts/drafts/xxx.md
   ```

   这一步会校验格式、检查重名和图片，但不写数据库。
4. **给我确认**：在对话里列出概要（菜名、分类、简介），附上预览文件的链接；**特别标出 agent 自己判断或补写的地方**，比如分类拿不准的菜、我没给简介的菜。
5. **写入**：我确认后运行 `npm run recipe -- add scripts/drafts/xxx.json`，再打开线上网站抽查。
6. **修改**：`show <slug>` 导出当前内容 → 改 JSON → `preview` → 给我确认 → `update`。
7. **删除**：先运行不带 `--yes` 的 `delete <slug>`，把要删的菜给我看，我同意后再加 `--yes`。

**没有我的明确确认，不运行 `add`、`update` 或 `delete --yes`。**

### 内容规范

| 字段 | 规范 |
|---|---|
| 菜名 `title` | 用我给的原文，不改字 |
| 分类 `category` | 按**主料**判断：肉、禽、海鲜为主是「荤菜」；蔬菜、豆腐、蛋为主是「素菜」（如西红柿炒鸡蛋）；以喝汤为主是「汤羹」；凉拌或冷吃是「凉菜」；饭、面、粥、饼是「主食」；甜品和点心是「甜点小吃」。带汤的煲按主料分（如番茄白菜肥牛煲是荤菜）。拿不准的在确认时标出来 |
| 简介 `summary` | 一句话，10～25 字，说清味道、口感或适合的场景；口吻像跟朋友介绍，不用夸张的网络用语 |
| 用料 `ingredients` | 主料在前，配料其次，调料最后；用量写成「300 克」「2 个」「1 勺」「少许」「适量」，数字和单位之间空一格；可选的写「（可选）」 |
| 做法 `steps` | 3～6 步，每步是一个阶段，以动作开头，写清火候和时间，每步不超过 50 字 |
| 小贴士 `tips` | 一条最关键的诀窍，说明为什么 |
| 用时 `prepTime` | 总时间（含腌制和炖煮），单位分钟，取 5 的倍数 |
| 份量 `servings` | 按用料估算，家常菜一般 2～3 人 |
| 难度 `difficulty` | 简单：一般人第一次就能做好；中等：要掌握火候或时机；较难：工序多、容易失败 |
| 标签 `tags` | 1～3 个，优先用常用词：下饭、快手、一人食、宴客、下酒、开胃、暖胃、清淡、麻辣、川菜、粤菜、砂锅、汤汤水水、甜品 |

## 部署到 Vercel

1. MongoDB Atlas 建一个免费 M0 集群，Network Access 允许 `0.0.0.0/0`，复制连接串
2. Cloudinary 注册，记下 Cloud name / API Key / API Secret
3. 代码推到 GitHub，在 Vercel 导入该仓库（设置保持默认即可，构建配置在 `vercel.json` 里）
4. 在 Vercel 项目的 Environment Variables 里填 `.env.example` 中的所有变量
5. 部署完成后访问 `/admin` 登录，开始加菜

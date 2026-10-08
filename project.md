# 项目进度：我的私房菜谱

> 最后更新：2026-10-08

## 项目目标

一个用来积攒自己多年家常菜谱的个人网站，同时方便朋友上来看看我会做什么、顺手点菜。
每道菜一张卡片，点开看做法。内容只有我一个人维护，朋友只看不改。

## 已确定的设计

| 项目 | 决定 |
|---|---|
| 技术栈 | MERN：React (Vite) + Express + MongoDB，纯 JavaScript，不用 TypeScript |
| 界面语言 | 只做中文 |
| 部署 | Vercel（前端 + Express 作为 Serverless 函数跑在 /api 下） |
| 网址 | https://menu.linqiumeng.com（linqiumeng.com 的子域名） |
| 数据库 | MongoDB Atlas 免费版 M0 |
| 图片 | Cloudinary，浏览器直传（绕开 Vercel 4.5MB 请求体限制） |
| 分类 | 每道菜必须属于一个分类：凉菜 / 荤菜 / 素菜 / 汤羹 / 主食 / 甜点小吃；另有自由标签 |
| 首页 | 顶部分类 Tab，加搜索（菜名、标签、食材，也支持拼音全拼和首字母） |
| 详情 | 弹窗 + URL：从首页点开是弹窗，直接打开链接是完整页面 |
| 点菜单 | 朋友勾选想吃的菜，一键复制成文字发微信；存在访客自己的浏览器里，不需要登录 |
| 后台 | /admin，单一密码登录（环境变量 ADMIN_PASSWORD），JWT 存在 httpOnly cookie |
| 后台入口 | 隐藏手势：2 秒内连续点 5 次网站标题；登录后顶栏才出现「后台」按钮，朋友看不到 |
| 界面风格 | 「暖阳厨房」：奶油色 + 珊瑚橙、大圆角卡片、圆体标题（ZCOOL KuaiLe），详情从底部弹出；v1 只做这一套 |
| 链接 | 菜名自动转拼音，例如 fan-qie-chao-dan；创建后不再改变 |

## 当前进度

### ✅ 已完成
- 首页：分类 Tab、搜索、卡片网格（手机两列、平板三列、电脑四列）
- 详情弹窗和独立详情页
- 点菜单
- 后台：登录、新增、编辑、删除菜谱，图片上传或粘贴链接
- 后端 API 和数据校验（分类不合法、必填项缺失时报错）
- 本地开发：没有配置 .env 时自动启动本地数据库，并导入 6 道示例菜
- seed 脚本：从 scripts/seed-data/ 批量导入菜谱和图片，按菜名去重
- 命令行管理脚本 scripts/recipe.js（见最后一节）
- 本地测试已通过：登录、增删改、权限拦截、弹窗、点菜单、手机端布局、命令行脚本
- 代码托管到 GitHub
- MongoDB Atlas 已连接，目前 5 道菜（4 道示例菜 + 自己加的黑椒牛肉）
- 部署到 Vercel，绑定子域名 menu.linqiumeng.com，HTTPS 自动签发
- 线上测试已通过：首页、详情链接、读取数据、权限拦截、后台登录，手机和平板布局
- 界面改版为「暖阳厨房」风格（从三套样稿中选定）
- 隐藏的后台入口（连点 5 次标题）
- 修复：搜索框无法用拼音输入法打中文（输入框改用自己的 state，组字结束后才同步到网址）
- 点菜单自动清理：已删除的菜移除，改名的菜同步新名字

### ⏳ 未验证
- Cloudinary 图片上传（还没有账号）

### 📋 待办
1. 注册 Cloudinary，把三项配置填进 .env 和 Vercel 环境变量（填完要在 Vercel 重新部署）
2. 用自己的菜替换剩下的 4 道示例菜（拍黄瓜、红烧肉、番茄蛋汤、蛋炒饭）：示例菜用 `npm run recipe -- delete` 删除，自己的菜让 agent 整理后用 `add` 添加
3. 确定网站名称（目前是占位的「我的私房菜谱」，在 client/src/config.js 里改）

## 以后再说

- 多主题切换：三套样稿（A 和风手帖 / B 暖阳厨房 / C 拍立得手账）在 `CC Project/design-demos/`，不在仓库里。
  v1 先只用 B，避免以后每加一个功能都要维护三套样式。等 B 稳定后，再考虑把 A、C 做成可切换的皮肤。

## 部署信息

| 项目 | 值 |
|---|---|
| 正式网址 | https://menu.linqiumeng.com |
| Vercel 默认网址 | https://qiumeng-recipe-client-three.vercel.app |
| Vercel 项目名 | qiumeng-recipe-client |
| GitHub 仓库 | https://github.com/Linqiumeng/qiumeng-recipe（main 分支） |
| 域名 | linqiumeng.com 在 Vercel 购买，DNS 由 Vercel 自动管理 |
| Vercel 环境变量 | MONGODB_URI、ADMIN_PASSWORD、JWT_SECRET（Cloudinary 待加） |

更新方式：
- 改代码：推送到 GitHub 的 main 分支，Vercel 自动部署
- 增删菜谱：用后台或命令行脚本直接改数据库，不需要重新部署
- 改环境变量：在 Vercel 改完后必须手动 Redeploy 才会生效
- 注意：本地 .env 已经连接线上 Atlas，本地后台和脚本的改动会直接出现在线上

## 用 agent 管理菜谱

不让 agent 操作网页后台（慢、不稳、需要交出密码），而是用命令行脚本：

    npm run recipe -- list [分类]                 列出所有菜
    npm run recipe -- show <slug>                 输出一道菜的完整 JSON
    npm run recipe -- add <文件.json>             新增（一道或数组）
    npm run recipe -- update <slug> <文件.json>   修改，只改文件里出现的字段
    npm run recipe -- delete <slug> [--yes]       删除，不加 --yes 只预览

- JSON 里的图片可以写本地路径（相对 JSON 文件所在目录），脚本会自动上传到 Cloudinary
- 先校验内容、检查图片都存在，再上传图片，有错误时不会留下半成品
- 没有设置 MONGODB_URI 时，连接 `npm run dev` 启动的本地数据库（端口 27018），可以先在本地试

加菜流程：
1. 我把照片和随手写的做法发给 agent
2. agent 整理成固定模板（分类、用料、步骤、标签、简介），先给我确认
3. 确认后 agent 运行脚本：图片上传到 Cloudinary，菜谱写入数据库

约定：
- 脚本从 .env 读取数据库连接，agent 不需要知道后台密码
- 每次删除前都必须先经过我确认
- 网页后台保留，在手机上可以自己手动加菜

# 木的粮仓

基于 Next.js 14 的同人文站。作品以纯静态 HTML 导入，构建时生成 JSON 数据；读者留言存于 Cloudflare D1，通过 Cloudflare Worker 提供接口。

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（默认 3002 端口）
```

> 注意：`npm run build` 前请先停止正在运行的 dev server，否则 `.next` 目录会被互相覆盖导致报错。

## npm scripts 一览

| 命令 | 功能 |
|---|---|
| `npm run dev` | 开发服务器，默认端口 **3002**；如需换端口用 `npx next dev -p 3000` |
| `npm run build` | 生产构建（含类型检查），产物在 `.next/` |
| `npm start` | 以生产模式启动（需先 build） |
| `npm run lint` | ESLint 检查 |
| `npm run import` | **核心发布命令**：清理源 HTML → 扫描导入 → 生成数据 JSON（详见下文） |
| `npm run clean` | 单独运行 HTML 清理脚本 clean-html.js |
| `npm run download-comments` | 把线上评论备份到本地 `data/comments.json` |

## Scripts 详解

### import-html.js（`npm run import`）

每部作品的完整处理流水线入口，内部会先调用 clean-html.js。

```bash
npm run import
```

1. 先执行清理：合并重复样式、剥离 Notion 页头（见 clean-html.js）。
2. 扫描 `public/content/works/` 下所有目录。
3. 读取每个目录的 `index.html` 与 `meta.json`。
4. 输出三份数据文件：
   - `data/works.json` — 作品与章节全文（含样式提取结果）
   - `data/series.json` — 系列（目录名以 `series-` 开头的文件夹）
   - `data/tags.json` — 标签库（自动追加；meta 中缺失或内容为空的属性**不会**生成对应 tag，条目会 trim 并去重。人工分类需手工维护 `category` 字段，重跑 import 不会覆盖已有分类）

**目录规范**：

```
public/content/works/
├── 关于小鸟的九事件/        # 单篇：一个目录 = 一部单章作品
│   ├── index.html           # 正文（Notion 导出的原始 HTML 可直接放入）
│   └── meta.json            # 元数据（title/description/tags/type 等）
├── 趁人之危/                # 连载：多个编号 html 即为多章
│   ├── meta.json            # type: serial
│   ├── 趁人之危-ch-001.html
│   └── 趁人之危-ch-002.html
└── series-各取所需/         # 系列容器：目录名必须以 series- 开头
    └── （系列内的作品目录）
```

### clean-html.js（`npm run clean` / 被 import 自动调用）

对 `public/content/works/**/*.html` 就地清理，主要做两件事：

1. **合并重复的 `<style>` 块**：跨作品比对内容完全一致（忽略空白差异）且出现次数 ≥2 的样式块，从各文件移除，统一写入共享文档 `public/content/works-shared.css`。各文件独有的样式保留原地。
2. **剥离 Notion 页头 `<header>`**（标题 + 属性表格），这些信息由 meta.json 承担。

脚本幂等，可重复运行。前端渲染章节时会自动同时加载 works-shared.css。

### download-comments.js（`npm run download-comments`）

从评论服务拉取全部留言并覆写本地 `data/comments.json`：

```bash
npm run download-comments
```

API 地址取自环境变量 `NEXT_PUBLIC_API_URL`（定义在 `.env.production` / `.env.development`），用于灾备和留档。

## 发布新作品流程

```bash
# 1. 从 Notion 导出 HTML 放入对应目录，并按模板填好 meta.json
#    （字段参考：public/content/works/README.md）
# 2. 导入并本地预览
npm run import
npx next dev -p 3000
# 3. 构建验证
npm run build && npm start
# 4. git push 后 Netlify 自动部署上线
```

## 评论 API（Cloudflare Worker）

服务地址配置在 `NEXT_PUBLIC_API_URL`，当前为 `https://fanfic-comments.elsholtzia-mu.workers.dev/api`，数据存储于 Cloudflare D1 `comments` 表。

| 方法 & 路径 | 说明 |
|---|---|
| `GET /api/comments` | 全部留言（倒序） |
| `GET /api/comments/:workId` | 某部作品的留言 |
| `POST /api/comments` | 发表留言，body: `{ "workId": "必填", "chapterId": "可选", "author": "缺省'访客'", "content": "必填" }` |
| `DELETE /api/comments/:commentId` | 按 id 删除留言 |

均支持 CORS。Worker 源码位于 `worker/src/index.js`，改动后用 wrangler 部署：

```bash
cd worker && npx wrangler deploy
```

## 部署

- **站点**：推送到 GitHub main 分支后由 Netlify 自动构建（`netlify.toml` 已配置 @netlify/plugin-nextjs）。
- **评论服务**：独立部署在 Cloudflare Workers，与站点解耦。

## 目录结构速览

```
src/app/          # 页面路由（App Router）
src/components/   # 组件（WorkCard / SeriesCard / Tag / CommentSection / ReadingArea）
src/lib/          # 类型定义与数据访问层
data/             # import 生成的 JSON（勿手改 works/series/tags）
scripts/          # 上文三个 Node 脚本
public/content/   # 作者维护的作品 HTML 源文件
worker/           # 评论服务（Cloudflare Worker + D1）
```

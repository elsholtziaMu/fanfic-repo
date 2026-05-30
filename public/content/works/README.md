# 作品内容目录

本目录存放所有作品的 HTML 内容和元数据。

---

## 📁 目录结构

### 1. 单篇作品（Oneshot）

```
作品名/
├── meta.json       # 作品元数据
└── index.html      # 作品正文
```

**meta.json 格式：**
```json
{
  "title": "作品标题",
  "summary": "作品简介",
  "warning": "警告内容（可选，不填则不显示）",
  "tags": {
    "au": ["ABO", "现代"],
    "cp_type": ["BL"],
    "main_char": ["角色A", "角色B"],
    "relationship": ["CP"],
    "status": ["已完结"],
    "rating": ["全年龄"]
  },
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01",
  "beginNote": "前言内容（可选）",
  "endNote": "后记内容（可选）"
}
```

---

### 2. 连载作品（Serial）

```
作品名/
├── meta.json              # 作品元数据
├── 章节1.html             # 第一章
├── 章节1.html.meta.json   # 第一章元数据（可选）
├── 章节2.html             # 第二章
├── 章节2.html.meta.json   # 第二章元数据（可选）
└── ...
```

**meta.json 格式：**
```json
{
  "title": "作品标题",
  "summary": "作品简介",
  "warning": "警告内容（可选）",
  "tags": {
    "au": ["ABO"],
    "cp_type": ["BL"],
    "main_char": ["角色A"],
    "relationship": ["CP"],
    "status": ["连载中"],
    "rating": ["R18"]
  },
  "createdAt": "2024-01-01",
  "updatedAt": "2024-12-01"
}
```

**章节 meta.json 格式（可选）：**
```json
{
  "title": "章节标题",
  "beginNote": "章节前言（可选）",
  "endNote": "章节后记（可选）",
  "updatedAt": "2024-01-15"
}
```

---

### 3. 系列（Series）

系列是**多部独立作品**的集合，每部作品可以是单篇或连载。

```
series-系列名/
├── meta.json       # 系列元数据
├── 作品1/
│   ├── meta.json
│   └── index.html（或多章节 html）
├── 作品2/
│   ├── meta.json
│   └── ...
└── ...
```

**系列 meta.json 格式：**
```json
{
  "title": "系列名称",
  "description": "系列简介",
  "order": ["作品1", "作品2", "作品3"]
}
```

**注意：**
- 系列文件夹名必须以 `series-` 开头
- `order` 数组定义作品的显示顺序，填作品文件夹名

---

## 🏷️ 标签分类

在 `data/tags.json` 中定义，当前分类：

| 分类 ID | 分类名称 | 示例标签 |
|---------|----------|----------|
| au | AU | ABO, 哨向, 现代, 古代 |
| cp_type | 配对类型 | BL, BG, GB, GL, 无CP |
| main_char | 主角 | 自定义角色名 |
| relationship | 关系 | 水仙, CP, CB, 群像 |
| status | 更新状态 | 连载中, 已完结, 坑 |
| rating | 限制级别 | 全年龄, 辅导级, 成人级 |

---

## 📝 命名规范

1. **文件夹名**：直接用作品名（如 `趁人之危/`）
2. **HTML 文件名**：章节名或序号（如 `趁人之危-1.html`）
3. **系列文件夹**：必须以 `series-` 开头

---

## 🔄 导入流程

1. 将 HTML 文件和 meta.json 放入对应目录
2. 运行导入脚本：
   ```bash
   npm run import
   ```
3. 脚本会自动生成 `data/works.json` 和 `data/series.json`

---

## ⚠️ 注意事项

- HTML 文件中的 `<style>` 和 `<head>` 会被保留
- `<body>` 内的 `.callout` 元素会被移除（不计入字数）
- 字数统计：中文按字数，英文按单词数，不统计标点
- 日期格式：`YYYY-MM-DD`

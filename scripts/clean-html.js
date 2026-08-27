const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content', 'works');
const SHARED_CSS_FILE = path.join(__dirname, '..', 'public', 'content', 'works-shared.css');

const SHARED_HEADER = `/*
 * 作品共享样式（自动生成，请勿手改）
 * 由 scripts/clean-html.js 从作品 HTML 中提取的重复 <style> 内容。
 * 每次渲染作品正文时由 /works/[id]/[chapterId] 页面加载。
 * 重新生成：npm run clean （npm run import 也会自动执行）
 */
`;

function listHtmlFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listHtmlFiles(p));
    } else if (entry.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

function normalizeCss(css) {
  return css.replace(/\s+/g, ' ').trim();
}

// 移除 body 内的 Notion 导出页头（标题 + 属性表），其中内容与 meta.json 重复。
// 仅当 header 中含有 .page-title 或 .properties 时才移除，避免误删真正的正文。
function stripNotionHeader(html) {
  return html.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, m => {
    return /class="[^"]*(page-title|properties)[^"]*"/.test(m) ? '' : m;
  });
}

function findStyleBlocks(html) {
  const blocks = [];
  const blockRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = blockRegex.exec(html))) {
    blocks.push({
      start: m.index,
      end: m.index + m[0].length,
      inner: m[1],
      key: normalizeCss(m[1]),
    });
  }
  return blocks;
}

function cleanAll() {
  const files = listHtmlFiles(CONTENT_DIR);
  if (files.length === 0) {
    console.log('⚠️  作品目录下没有 HTML 文件，跳过清理');
    return;
  }

  // 第一遍：读取所有文件，移除 Notion 页头，收集样式块
  const docs = files.map(file => {
    const original = fs.readFileSync(file, 'utf8');
    const headerStripped = stripNotionHeader(original);
    return { file, original, html: headerStripped, blocks: findStyleBlocks(headerStripped) };
  });

  // 跨文件统计归一化后相同的样式块
  const counts = new Map();
  for (const doc of docs) {
    for (const b of doc.blocks) {
      counts.set(b.key, (counts.get(b.key) || 0) + 1);
    }
  }

  // 第二遍：删除出现 >=2 次的样式块，每组保留一个代表副本写入共享文件
  const sharedCssParts = [];
  let totalSaved = 0;
  const touched = [];

  for (const doc of docs) {
    const ranges = doc.blocks.filter(b => (counts.get(b.key) || 0) >= 2);
    for (const b of ranges) {
      if (!sharedCssParts.some(inner => normalizeCss(inner) === b.key)) {
        sharedCssParts.push(b.inner);
      }
    }

    let html = doc.html;
    for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
      html = html.slice(0, r.start) + html.slice(r.end);
    }

    const saved = doc.original.length - html.length; // 页头 + 样式块的总缩减量
    if (saved > 0) {
      fs.writeFileSync(doc.file, html, 'utf8');
      touched.push(`  - ${path.relative(CONTENT_DIR, doc.file)}（节省 ${(saved / 1024).toFixed(1)}KB）`);
      totalSaved += saved;
    }
  }

  let sharedNote = '';
  if (sharedCssParts.length > 0) {
    const size = sharedCssParts.reduce((n, s) => n + s.length, 0);
    fs.writeFileSync(SHARED_CSS_FILE, SHARED_HEADER + sharedCssParts.join('\n\n'), 'utf8');
    sharedNote = `\n📄 已将重复样式合并到 public/content/works-shared.css（${(size / 1024).toFixed(1)}KB）`;
  }

  console.log(`🧹 清理完成${touched.length ? `，修改了 ${touched.length} 个文件` : '，无需修改'}`);
  touched.forEach(l => console.log(l));
  console.log(`💾 共减少冗余内容 ${(totalSaved / 1024).toFixed(1)}KB${sharedNote}`);
}

if (require.main === module) {
  cleanAll();
}

module.exports = { cleanAll };

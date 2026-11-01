const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content', 'works');
const SHARED_CSS_FILE = path.join(__dirname, '..', 'public', 'content', 'works-shared.css');

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

// 移除 body 内的 Notion 导出引用块（作品简介），内容与 meta.json 重复。
function stripBlockquotes(html) {
  return html.replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, '');
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

// 读取 works-shared.css 全文（归一化后）作为覆盖判定基准。
// shared css 从此完全冻结：脚本只读不写，导入新作品不会改动它，
// 已被 shared css 覆盖的样式块会从 HTML 中移除，未覆盖的原样保留。
function loadSharedCss() {
  if (!fs.existsSync(SHARED_CSS_FILE)) return '';
  return normalizeCss(fs.readFileSync(SHARED_CSS_FILE, 'utf8').replace(/^\/\*[\s\S]*?\*\//, ''));
}

// 判断样式块是否已被 shared css 覆盖：按规则（'}' 分段）逐条检查是否都存在。
// 不按空行切分样式组，因为样式块内部本身可能含空行，无法按块精确对齐。
function isCoveredByShared(blockKey, sharedCss) {
  return blockKey.split('}').every(seg => sharedCss.includes(seg));
}

function cleanAll() {
  const files = listHtmlFiles(CONTENT_DIR);
  if (files.length === 0) {
    console.log('⚠️  作品目录下没有 HTML 文件，跳过清理');
    return;
  }

  const sharedCss = loadSharedCss();

  // 读取所有文件，移除 Notion 页头，收集样式块
  const docs = files.map(file => {
    const original = fs.readFileSync(file, 'utf8');
    const html = stripBlockquotes(stripNotionHeader(original));
    return { file, original, html, blocks: findStyleBlocks(html) };
  });

  // 删除已被 shared css 覆盖的样式块；未覆盖的样式原样保留
  let totalSaved = 0;
  const touched = [];

  for (const doc of docs) {
    const ranges = doc.blocks.filter(b => isCoveredByShared(b.key, sharedCss));

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

  console.log(`🧹 清理完成${touched.length ? `，修改了 ${touched.length} 个文件` : '，无需修改'}`);
  touched.forEach(l => console.log(l));
  console.log(`💾 共减少冗余内容 ${(totalSaved / 1024).toFixed(1)}KB（works-shared.css 保持不变）`);
}

if (require.main === module) {
  cleanAll();
}

module.exports = { cleanAll };

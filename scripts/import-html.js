const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const { cleanAll } = require('./clean-html');

const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content', 'works');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'works.json');
const SERIES_OUTPUT_FILE = path.join(__dirname, '..', 'data', 'series.json');
const TAGS_FILE = path.join(__dirname, '..', 'data', 'tags.json');

// 清洗 tags：缺失/非数组/去空白后为空的分类一律不生成，
// 条目 trim、去重；返回值保证 Record<string, string[]>
function sanitizeTags(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const clean = {};
  for (const [categoryId, value] of Object.entries(raw)) {
    if (!Array.isArray(value)) continue;
    const items = [...new Set(value.map(t => String(t).trim()).filter(Boolean))];
    if (items.length === 0) continue;
    clean[categoryId] = items;
  }
  return clean;
}

function getDates(meta) {
  const today = new Date().toISOString().split('T')[0];
  
  if (meta.createdAt && !meta.updatedAt) {
    return { createdAt: meta.createdAt, updatedAt: meta.createdAt };
  }
  
  if (!meta.createdAt && meta.updatedAt) {
    return { createdAt: meta.updatedAt, updatedAt: meta.updatedAt };
  }
  
  return {
    createdAt: meta.createdAt || today,
    updatedAt: meta.updatedAt || today
  };
}

function trimContent(content) {
  let trimmed = content;
  
  trimmed = trimmed.replace(/^\s*<body[^>]*>\s*/i, '<body>');
  trimmed = trimmed.replace(/\s*<\/body>\s*$/i, '</body>');
  
  trimmed = trimmed.replace(/<body>\s*/i, '<body>');
  trimmed = trimmed.replace(/\s*<\/body>/i, '</body>');
  
  const emptyDivPattern = /<div[^>]*display:contents[^>]*>\s*<p[^>]*>\s*<\/p>\s*<\/div>/gi;
  const hrDivPattern = /<div[^>]*display:contents[^>]*>\s*<hr[^>]*\/?>\s*<\/div>/gi;
  
  while (true) {
    const beforeBody = trimmed.match(/<body>([\s\S]*?)(<div[^>]*display:contents[^>]*>\s*<(p|hr)[^>]*>[\s\S]*?<\/div>)/i);
    if (beforeBody) {
      const afterBody = beforeBody[1];
      if (afterBody.trim() === '' || /^[\s]*$/.test(afterBody)) {
        trimmed = trimmed.replace(/<body>\s*<div[^>]*display:contents[^>]*>\s*<(p|hr)[^>]*>[\s\S]*?<\/div>/i, '<body>');
        continue;
      }
    }
    break;
  }
  
  while (true) {
    const beforeEnd = trimmed.match(/(<div[^>]*display:contents[^>]*>\s*<(p|hr)[^>]*>[\s\S]*?<\/div>)([\s\S]*?)<\/body>/i);
    if (beforeEnd) {
      const afterHr = beforeEnd[3];
      if (afterHr.trim() === '' || /^[\s]*$/.test(afterHr)) {
        trimmed = trimmed.replace(/<div[^>]*display:contents[^>]*>\s*<(p|hr)[^>]*>[\s\S]*?<\/div>\s*<\/body>/i, '</body>');
        continue;
      }
    }
    break;
  }
  
  return trimmed;
}

async function readHtmlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const body = document.querySelector('body') || document;

    const pageTitle = body.querySelector('.page-title');
    if (pageTitle) {
      const header = pageTitle.closest('header');
      if (header) {
        header.remove();
      } else {
        pageTitle.remove();
      }
    }

    const callouts = body.querySelectorAll('.callout');
    callouts.forEach(el => el.remove());

    const pageBody = body.querySelector('.page-body');
    const targetElement = pageBody || body;

    function isEmptyElement(el) {
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      
      if (tagName === 'p') {
        return !el.textContent || el.textContent.trim() === '';
      }
      
      if (tagName === 'hr') {
        return true;
      }
      
      if (tagName === 'div') {
        const style = el.getAttribute('style') || '';
        if (style.includes('display:contents')) {
          const children = el.children;
          if (children.length === 1) {
            return isEmptyElement(children[0]);
          }
          if (children.length === 0) {
            return true;
          }
        }
      }
      
      return false;
    }

    while (targetElement.firstElementChild && isEmptyElement(targetElement.firstElementChild)) {
      targetElement.firstElementChild.remove();
    }

    while (targetElement.lastElementChild && isEmptyElement(targetElement.lastElementChild)) {
      targetElement.lastElementChild.remove();
    }

    let textContent = body.textContent || '';

    const chineseChars = textContent.match(/[\u4e00-\u9fff]/g) || [];

    const englishText = textContent.replace(/[\u4e00-\u9fff]/g, ' ');
    const englishWords = englishText.match(/[a-zA-Z]+/g) || [];
    const englishWordCount = englishWords.length;

    const wordCount = chineseChars.length + englishWordCount;

    const cleanedContent = trimContent(dom.serialize());

    return {
      content: cleanedContent,
      textContent: textContent.trim(),
      wordCount: wordCount
    };
  } catch (error) {
    console.error(`Error reading HTML file ${filePath}:`, error.message);
    return null;
  }
}

async function processOneshot(workPath, workId) {
  const metaPath = path.join(workPath, 'meta.json');
  const indexPath = path.join(workPath, 'index.html');

  try {
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    const htmlData = await readHtmlFile(indexPath);

    if (!htmlData) return null;

    const dates = getDates(meta);

    return {
      id: workId,
      title: meta.title || workId,
      type: 'oneshot',
      seriesId: null,
      seriesOrder: null,
      summary: meta.summary || '',
      warning: meta.warning || '',
      tags: sanitizeTags(meta.tags),
      wordCount: htmlData.wordCount,
      createdAt: dates.createdAt,
      updatedAt: dates.updatedAt,
      chapters: [{
        id: `${workId}-ch-001`,
        title: meta.title || '全文',
        content: htmlData.content,
        beginNote: meta.beginNote || '',
        endNote: meta.endNote || '',
        wordCount: htmlData.wordCount,
        updatedAt: dates.updatedAt
      }]
    };
  } catch (error) {
    console.error(`Error processing oneshot ${workPath}:`, error.message);
    return null;
  }
}

async function processSeries(seriesPath, seriesId) {
  const metaPath = path.join(seriesPath, 'meta.json');

  try {
    const seriesMeta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    const works = [];
    const workIds = [];

    for (const workId of seriesMeta.order || []) {
      const workPath = path.join(seriesPath, workId);
      const work = await processSerialWork(workPath, workId, seriesId);
      if (work) {
        works.push(work);
        workIds.push(workId);
      }
    }

    return {
      id: seriesId,
      name: seriesMeta.title || seriesId,
      description: seriesMeta.description || '',
      workIds: workIds,
      works: works
    };
  } catch (error) {
    console.error(`Error processing series ${seriesPath}:`, error.message);
    return null;
  }
}

async function processSerialWork(workPath, workId, seriesId) {
  const metaPath = path.join(workPath, 'meta.json');

  try {
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    const chapters = [];
    let totalWordCount = 0;

    const dates = getDates(meta);

    const files = await fs.readdir(workPath);
    const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'meta.json');

    htmlFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (let i = 0; i < htmlFiles.length; i++) {
      const filePath = path.join(workPath, htmlFiles[i]);
      const htmlData = await readHtmlFile(filePath);

      if (htmlData) {
        let chapterMeta = {};
        const chapterMetaPath = path.join(workPath, `${htmlFiles[i]}.meta.json`);
        try {
          chapterMeta = JSON.parse(await fs.readFile(chapterMetaPath, 'utf8'));
        } catch (e) {
        }

        const chapterDates = getDates({ createdAt: chapterMeta.updatedAt, updatedAt: chapterMeta.updatedAt });

        chapters.push({
          id: `${workId}-ch-${String(i + 1).padStart(3, '0')}`,
          title: chapterMeta.title || htmlFiles[i].replace('.html', ''),
          content: htmlData.content,
          warning: chapterMeta.warning || '',
          beginNote: chapterMeta.beginNote || '',
          endNote: chapterMeta.endNote || '',
          wordCount: htmlData.wordCount,
          updatedAt: chapterMeta.updatedAt || dates.updatedAt
        });
        totalWordCount += htmlData.wordCount;
      }
    }

    return {
      id: workId,
      title: meta.title || workId,
      type: 'serial',
      seriesId: seriesId,
      seriesOrder: meta.order || 0,
      summary: meta.summary || '',
      warning: meta.warning || '',
      tags: sanitizeTags(meta.tags),
      wordCount: totalWordCount,
      createdAt: dates.createdAt,
      updatedAt: dates.updatedAt,
      chapters: chapters
    };
  } catch (error) {
    console.error(`Error processing serial work ${workPath}:`, error.message);
    return null;
  }
}

async function processStandaloneSerial(workPath, workId) {
  const metaPath = path.join(workPath, 'meta.json');

  try {
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    const chapters = [];
    let totalWordCount = 0;

    const dates = getDates(meta);

    const files = await fs.readdir(workPath);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    htmlFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (let i = 0; i < htmlFiles.length; i++) {
      const filePath = path.join(workPath, htmlFiles[i]);
      const htmlData = await readHtmlFile(filePath);

      if (htmlData) {
        let chapterMeta = {};
        const chapterMetaPath = path.join(workPath, `${htmlFiles[i]}.meta.json`);
        try {
          chapterMeta = JSON.parse(await fs.readFile(chapterMetaPath, 'utf8'));
        } catch (e) {
        }

        chapters.push({
          id: `${workId}-ch-${String(i + 1).padStart(3, '0')}`,
          title: chapterMeta.title || htmlFiles[i].replace('.html', ''),
          content: htmlData.content,
          warning: chapterMeta.warning || '',
          beginNote: chapterMeta.beginNote || '',
          endNote: chapterMeta.endNote || '',
          wordCount: htmlData.wordCount,
          updatedAt: chapterMeta.updatedAt || dates.updatedAt
        });
        totalWordCount += htmlData.wordCount;
      }
    }

    return {
      id: workId,
      title: meta.title || workId,
      type: 'serial',
      seriesId: null,
      seriesOrder: null,
      summary: meta.summary || '',
      warning: meta.warning || '',
      tags: sanitizeTags(meta.tags),
      wordCount: totalWordCount,
      createdAt: dates.createdAt,
      updatedAt: dates.updatedAt,
      chapters: chapters
    };
  } catch (error) {
    console.error(`Error processing standalone serial ${workPath}:`, error.message);
    return null;
  }
}

async function updateTags(works) {
  try {
    let tagsConfig = { categories: [] };
    
    try {
      const tagsContent = await fs.readFile(TAGS_FILE, 'utf8');
      tagsConfig = JSON.parse(tagsContent);
    } catch (e) {
      console.log('⚠️  未找到 tags.json，将创建新文件');
    }

    const allTags = {};
    
    works.forEach(work => {
      if (work.tags) {
        Object.keys(work.tags).forEach(categoryId => {
          if (!allTags[categoryId]) {
            allTags[categoryId] = new Set();
          }
          work.tags[categoryId].forEach(tag => {
            allTags[categoryId].add(tag);
          });
        });
      }
    });

    tagsConfig.categories.forEach(category => {
      const categoryTags = allTags[category.id] || new Set();
      
      category.tags.forEach(tag => {
        categoryTags.add(tag);
      });
      
      category.tags = [...categoryTags].sort();
      delete allTags[category.id];
    });

    Object.keys(allTags).forEach(categoryId => {
      tagsConfig.categories.push({
        id: categoryId,
        name: categoryId,
        tags: [...allTags[categoryId]].sort()
      });
    });

    await fs.writeFile(TAGS_FILE, JSON.stringify(tagsConfig, null, 2), 'utf8');
    console.log(`✅ 成功更新 tags.json`);
    
  } catch (error) {
    console.error('❌ 更新 tags.json 时出错:', error);
  }
}

async function generateData() {
  console.log('🔄 开始扫描HTML文件...');

  try {
    cleanAll();

    await fs.mkdir(CONTENT_DIR, { recursive: true });

    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const works = [];
    const seriesList = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const entryPath = path.join(CONTENT_DIR, entry.name);

      if (entry.name.startsWith('series-')) {
        const series = await processSeries(entryPath, entry.name);
        if (series) {
          seriesList.push({
            id: series.id,
            name: series.name,
            description: series.description,
            workIds: series.workIds
          });
          works.push(...series.works);
        }
      } else {
        const files = await fs.readdir(entryPath);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        const hasIndex = htmlFiles.includes('index.html');

        if (hasIndex || htmlFiles.length === 1) {
          const work = await processOneshot(entryPath, entry.name);
          if (work) {
            works.push(work);
          }
        } else if (htmlFiles.length > 1) {
          const work = await processStandaloneSerial(entryPath, entry.name);
          if (work) {
            works.push(work);
          }
        }
      }
    }

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(works, null, 2), 'utf8');
    await fs.writeFile(SERIES_OUTPUT_FILE, JSON.stringify(seriesList, null, 2), 'utf8');

    await updateTags(works);

    console.log(`✅ 成功生成 ${works.length} 部作品`);
    console.log(`✅ 成功生成 ${seriesList.length} 个系列`);
    console.log(`📁 输出文件: ${OUTPUT_FILE}`);
    console.log(`📁 输出文件: ${SERIES_OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ 生成数据时出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateData();
}

module.exports = { generateData };

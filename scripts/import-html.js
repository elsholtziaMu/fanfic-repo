const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content', 'works');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'works.json');
const SERIES_OUTPUT_FILE = path.join(__dirname, '..', 'data', 'series.json');

async function readHtmlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;

    let textContent = '';
    const body = document.querySelector('body');
    if (body) {
      textContent = body.textContent || '';
    } else {
      textContent = document.textContent || '';
    }

    const title = document.querySelector('title')?.textContent ||
                  path.basename(filePath, '.html');

    return {
      content: content,
      textContent: textContent.trim(),
      wordCount: textContent.replace(/\s+/g, '').length
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

    return {
      id: workId,
      title: meta.title || workId,
      type: 'oneshot',
      seriesId: null,
      seriesOrder: null,
      summary: meta.summary || '',
      tags: meta.tags || {},
      wordCount: htmlData.wordCount,
      createdAt: meta.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: meta.updatedAt || new Date().toISOString().split('T')[0],
      chapters: [{
        id: `${workId}-ch-001`,
        title: meta.title || '全文',
        content: htmlData.content,
        beginNote: meta.beginNote || '',
        endNote: meta.endNote || '',
        wordCount: htmlData.wordCount,
        updatedAt: meta.updatedAt || new Date().toISOString().split('T')[0]
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

        chapters.push({
          id: `${workId}-ch-${String(i + 1).padStart(3, '0')}`,
          title: chapterMeta.title || htmlFiles[i].replace('.html', ''),
          content: htmlData.content,
          beginNote: chapterMeta.beginNote || '',
          endNote: chapterMeta.endNote || '',
          wordCount: htmlData.wordCount,
          updatedAt: chapterMeta.updatedAt || meta.updatedAt || new Date().toISOString().split('T')[0]
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
      tags: meta.tags || {},
      wordCount: totalWordCount,
      createdAt: meta.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: meta.updatedAt || new Date().toISOString().split('T')[0],
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
          beginNote: chapterMeta.beginNote || '',
          endNote: chapterMeta.endNote || '',
          wordCount: htmlData.wordCount,
          updatedAt: chapterMeta.updatedAt || meta.updatedAt || new Date().toISOString().split('T')[0]
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
      tags: meta.tags || {},
      wordCount: totalWordCount,
      createdAt: meta.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: meta.updatedAt || new Date().toISOString().split('T')[0],
      chapters: chapters
    };
  } catch (error) {
    console.error(`Error processing standalone serial ${workPath}:`, error.message);
    return null;
  }
}

async function generateData() {
  console.log('🔄 开始扫描HTML文件...');

  try {
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

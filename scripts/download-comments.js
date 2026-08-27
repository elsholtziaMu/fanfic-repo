const fs = require('fs').promises;
const path = require('path');

const API_URL = 'https://fanfic-comments.elsholtzia-mu.workers.dev/api/comments';
const LOCAL_COMMENTS_PATH = path.join(__dirname, '..', 'data', 'comments.json');

async function downloadComments() {
  try {
    console.log('📥 正在从 Cloudflare Worker 下载留言...');
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const comments = await response.json();
    
    console.log(`✅ 下载到 ${comments.length} 条留言`);
    
    await fs.writeFile(LOCAL_COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf8');
    console.log(`💾 已保存到 ${LOCAL_COMMENTS_PATH}`);
    
    console.log('\n🎉 下载完成！');
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    process.exit(1);
  }
}

downloadComments();
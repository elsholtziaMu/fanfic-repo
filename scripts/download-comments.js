const fs = require('fs').promises;
const path = require('path');
const { execFileSync } = require('child_process');

const API_URL = 'https://fanfic-comments.elsholtzia-mu.workers.dev/api/comments';
const LOCAL_COMMENTS_PATH = path.join(__dirname, '..', 'data', 'comments.json');

// 读取代理配置(支持大小写两种写法)
function getProxy() {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY ||
         process.env.https_proxy || process.env.http_proxy;
}

// 通过 curl 下载(支持代理)。curl 是 macOS 自带的,且原生支持 -x 代理参数,
// 避免引入 undici / https-proxy-agent 等额外依赖。
function fetchWithCurl(url, proxy) {
  const args = ['-sS', '-m', '30', '-o', '-', '-w', '\n__HTTP_CODE__:%{http_code}'];
  if (proxy) args.unshift('-x', proxy);
  args.push(url);

  const output = execFileSync('curl', args, {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });

  const separator = '\n__HTTP_CODE__:';
  const sepIdx = output.lastIndexOf(separator);
  if (sepIdx === -1) {
    throw new Error(`curl 返回格式异常: ${output.substring(0, 100)}`);
  }
  const body = output.substring(0, sepIdx);
  const httpCode = output.substring(sepIdx + separator.length).trim();
  return { body, httpCode };
}

async function downloadComments() {
  const proxy = getProxy();

  try {
    console.log('📥 正在从 Cloudflare Worker 下载留言...');
    if (proxy) {
      console.log(`🔗 通过代理: ${proxy}`);
    } else {
      console.log('⚠️  未配置代理,直连 workers.dev');
    }

    const { body, httpCode } = fetchWithCurl(API_URL, proxy);

    if (httpCode !== '200') {
      throw new Error(`HTTP ${httpCode}\n响应内容: ${body.substring(0, 200)}`);
    }

    const comments = JSON.parse(body);
    console.log(`✅ 下载到 ${comments.length} 条留言`);

    await fs.writeFile(LOCAL_COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf8');
    console.log(`💾 已保存到 ${LOCAL_COMMENTS_PATH}`);

    console.log('\n🎉 下载完成！');
  } catch (error) {
    console.error('❌ 下载失败:', error.message);

    // 网络层失败时给出可操作的修复指引
    const msg = error.message;
    if (msg.includes('HTTP 000') || msg.includes('timed out') ||
        msg.includes('Connection') || msg.includes('Could not resolve')) {
      console.error('\n💡 workers.dev 域名在国内被墙(DNS 污染 + SNI 阻断)。');
      console.error('   请确保已开启系统代理(如 Clash),然后用代理运行:');
      console.error('   HTTPS_PROXY=http://127.0.0.1:7897 npm run download-comments');
    }
    process.exit(1);
  }
}

downloadComments();

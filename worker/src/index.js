export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/comments' && request.method === 'GET') {
        return handleGetAllComments(env, corsHeaders);
      }

      if (path.match(/^\/api\/comments\/(.+)$/) && request.method === 'GET') {
        const workId = decodeURIComponent(path.split('/')[3]);
        return handleGetCommentsByWorkId(workId, env, corsHeaders);
      }

      if (path === '/api/comments' && request.method === 'POST') {
        return handleCreateComment(request, env, corsHeaders);
      }

      if (path.match(/^\/api\/comments\/(.+)$/) && request.method === 'DELETE') {
        const commentId = decodeURIComponent(path.split('/')[3]);
        return handleDeleteComment(commentId, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleGetAllComments(env, corsHeaders) {
  const { results } = await env.DB.prepare('SELECT * FROM comments ORDER BY createdAt DESC').all();
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetCommentsByWorkId(workId, env, corsHeaders) {
  const { results } = await env.DB.prepare('SELECT * FROM comments WHERE workId = ? ORDER BY createdAt DESC').bind(workId).all();
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCreateComment(request, env, corsHeaders) {
  const body = await request.json();
  const { workId, chapterId, author = '访客', content } = body;

  if (!workId || !content) {
    return new Response(JSON.stringify({ error: 'workId and content are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const id = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString().split('T')[0];

  await env.DB.prepare(
    'INSERT INTO comments (id, workId, chapterId, author, content, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, workId, chapterId || null, author, content, createdAt).run();

  return new Response(JSON.stringify({ id, workId, chapterId, author, content, createdAt }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDeleteComment(commentId, env, corsHeaders) {
  const { meta } = await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run();

  if (meta.changes === 0) {
    return new Response(JSON.stringify({ error: 'Comment not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: 'Comment deleted successfully' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
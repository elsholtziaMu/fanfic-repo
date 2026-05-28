const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const DATA_DIR = path.join(__dirname, '..', 'data');

app.use(cors());
app.use(express.json());

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// API Routes
app.get('/api/comments', async (req, res) => {
  try {
    const commentsPath = path.join(DATA_DIR, 'comments.json');
    const commentsData = await fs.readFile(commentsPath, 'utf8');
    res.json(JSON.parse(commentsData));
  } catch (error) {
    console.error('Error reading comments:', error);
    res.status(500).json({ error: 'Failed to read comments' });
  }
});

app.get('/api/comments/:workId', async (req, res) => {
  try {
    const commentsPath = path.join(DATA_DIR, 'comments.json');
    const commentsData = await fs.readFile(commentsPath, 'utf8');
    const comments = JSON.parse(commentsData);
    const workComments = comments.filter(c => c.workId === req.params.workId);
    res.json(workComments);
  } catch (error) {
    console.error('Error reading comments:', error);
    res.status(500).json({ error: 'Failed to read comments' });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { workId, chapterId, author, content } = req.body;

    if (!workId || !author || !content) {
      return res.status(400).json({ error: 'workId, author, and content are required' });
    }

    const commentsPath = path.join(DATA_DIR, 'comments.json');
    const commentsData = await fs.readFile(commentsPath, 'utf8');
    const comments = JSON.parse(commentsData);

    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workId,
      chapterId,
      author,
      content,
      createdAt: getCurrentDate()
    };

    comments.push(newComment);
    await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2), 'utf8');

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const commentsPath = path.join(DATA_DIR, 'comments.json');
    const commentsData = await fs.readFile(commentsPath, 'utf8');
    let comments = JSON.parse(commentsData);

    const commentIndex = comments.findIndex(c => c.id === req.params.commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comments.splice(commentIndex, 1);
    await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2), 'utf8');

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.get('/api/works', async (req, res) => {
  try {
    const worksPath = path.join(DATA_DIR, 'works.json');
    const worksData = await fs.readFile(worksPath, 'utf8');
    res.json(JSON.parse(worksData));
  } catch (error) {
    console.error('Error reading works:', error);
    res.status(500).json({ error: 'Failed to read works' });
  }
});

app.get('/api/series', async (req, res) => {
  try {
    const seriesPath = path.join(DATA_DIR, 'series.json');
    const seriesData = await fs.readFile(seriesPath, 'utf8');
    res.json(JSON.parse(seriesData));
  } catch (error) {
    console.error('Error reading series:', error);
    res.status(500).json({ error: 'Failed to read series' });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const tagsPath = path.join(DATA_DIR, 'tags.json');
    const tagsData = await fs.readFile(tagsPath, 'utf8');
    res.json(JSON.parse(tagsData));
  } catch (error) {
    console.error('Error reading tags:', error);
    res.status(500).json({ error: 'Failed to read tags' });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const configPath = path.join(DATA_DIR, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    res.json(JSON.parse(configData));
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read config' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

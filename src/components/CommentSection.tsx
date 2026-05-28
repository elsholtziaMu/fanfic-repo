'use client'

import { Comment } from '@/lib/types';
import { useState } from 'react';

interface CommentSectionProps {
  workId: string;
  chapterId?: string;
  initialComments: Comment[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

export default function CommentSection({ workId, chapterId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId, chapterId, author, content }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setAuthor('');
        setContent('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">评论区</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="输入昵称..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">评论内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写点什么..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={4}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !author.trim() || !content.trim()}
        >
          {isSubmitting ? '发送中...' : '发布评论'}
        </button>
      </form>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{comment.author}</span>
                <span className="text-sm text-gray-400">{comment.createdAt}</span>
              </div>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">暂无评论</p>
      )}
    </div>
  );
}

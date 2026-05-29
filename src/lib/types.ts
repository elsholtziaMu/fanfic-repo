export interface SiteConfig {
  title: string
  subtitle: string
  announcement: string
  disclaimer: string
  authorName: string
}

export interface TagCategory {
  id: string
  name: string
  tags: string[]
}

export interface Work {
  id: string
  title: string
  type: 'serial' | 'oneshot'
  seriesId?: string | null
  seriesOrder?: number | null
  summary: string
  tags: Record<string, string[]>
  wordCount: number
  createdAt: string
  updatedAt: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  content: string
  wordCount: number
  updatedAt: string
}

export interface Series {
  id: string
  name: string
  description: string
  workIds: string[]
}

export interface Author {
  id: string
  name: string
  description: string
  link?: string
}

export interface Comment {
  id: string
  workId: string
  chapterId?: string
  author: string
  content: string
  createdAt: string
}

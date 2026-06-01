import { SiteConfig, TagCategory, Work, Series, Author, Comment, Recommendation } from './types'
import configData from '@/data/config.json'
import tagsData from '@/data/tags.json'
import worksData from '@/data/works.json'
import seriesData from '@/data/series.json'
import authorsData from '@/data/authors.json'
import commentsData from '@/data/comments.json'
import recommendationsData from '@/data/recommendations.json'

export function getConfig(): SiteConfig {
  return configData as SiteConfig
}

export function getTagCategories(): TagCategory[] {
  return tagsData.categories as TagCategory[]
}

export function getAllTags(): Record<string, string[]> {
  const categories = getTagCategories()
  const tags: Record<string, string[]> = {}
  categories.forEach(cat => {
    tags[cat.id] = cat.tags
  })
  return tags
}

export function getWorks(): Work[] {
  return worksData as Work[]
}

export function getWorkById(id: string): Work | undefined {
  return (worksData as Work[]).find(w => w.id === id)
}

export function getSeries(): Series[] {
  return seriesData as Series[]
}

export function getSeriesById(id: string): Series | undefined {
  return (seriesData as Series[]).find(s => s.id === id)
}

export function getAuthors(): Author[] {
  return authorsData as Author[]
}

export function getComments(): Comment[] {
  return commentsData as Comment[]
}

export function getCommentsByWorkId(workId: string): Comment[] {
  return (commentsData as Comment[]).filter(c => c.workId === workId)
}

export function getRecommendations(): Recommendation[] {
  return (recommendationsData as Recommendation[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function filterWorks(
  works: Work[],
  searchQuery: string,
  selectedTags: Record<string, string[]>,
  workType?: 'serial' | 'oneshot'
): Work[] {
  return works.filter(work => {
    if (searchQuery && !work.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    if (workType && work.type !== workType) {
      return false
    }

    for (const [categoryId, tags] of Object.entries(selectedTags)) {
      if (tags.length > 0) {
        const workTags = work.tags[categoryId] || []
        if (!tags.some(tag => workTags.includes(tag))) {
          return false
        }
      }
    }

    return true
  })
}

export function sortWorks(
  works: Work[],
  sortBy: 'wordCount' | 'updatedAt' | 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Work[] {
  return [...works].sort((a, b) => {
    let comparison = 0
    if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
      comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
    } else {
      comparison = a.wordCount - b.wordCount
    }
    return order === 'desc' ? -comparison : comparison
  })
}

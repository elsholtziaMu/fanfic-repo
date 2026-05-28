'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Work } from '@/lib/types'
import { getWorks, getTagCategories, filterWorks, sortWorks } from '@/lib/data'

export default function WorksPage() {
  const works = getWorks()
  const categories = getTagCategories()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({})
  const [workType, setWorkType] = useState<'all' | 'serial' | 'oneshot'>('all')
  const [sortBy, setSortBy] = useState<'wordCount' | 'updatedAt' | 'createdAt'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const filteredWorks = useMemo(() => {
    let result = filterWorks(works, searchQuery, selectedTags, workType === 'all' ? undefined : workType)
    result = sortWorks(result, sortBy, sortOrder)
    return result
  }, [works, searchQuery, selectedTags, workType, sortBy, sortOrder])

  const toggleTag = (categoryId: string, tag: string) => {
    setSelectedTags(prev => {
      const current = prev[categoryId] || []
      if (current.includes(tag)) {
        return { ...prev, [categoryId]: current.filter(t => t !== tag) }
      } else {
        return { ...prev, [categoryId]: [...current, tag] }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">作品总览</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary"
        >
          {showFilters ? '收起筛选' : '展开筛选'}
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="搜索作品标题..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <select
            value={workType}
            onChange={e => setWorkType(e.target.value as typeof workType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">全部类型</option>
            <option value="serial">连载</option>
            <option value="oneshot">单篇</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="updatedAt">按更新时间</option>
            <option value="createdAt">按创建时间</option>
            <option value="wordCount">按字数</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary"
          >
            {sortOrder === 'desc' ? '降序 ↓' : '升序 ↑'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4">标签筛选</h3>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id}>
                <h4 className="font-medium text-gray-600 mb-2">{category.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map(tag => {
                    const isSelected = (selectedTags[category.id] || []).includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(category.id, tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedTags({})}
            className="mt-4 text-sm text-rose-600 hover:text-rose-700"
          >
            清除所有筛选
          </button>
        </div>
      )}

      <div className="text-gray-600">
        共 {filteredWorks.length} 部作品
      </div>

      <div className="grid gap-6">
        {filteredWorks.map(work => (
          <WorkCard key={work.id} work={work} />
        ))}
        {filteredWorks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到符合条件的作品
          </div>
        )}
      </div>
    </div>
  )
}

function WorkCard({ work }: { work: Work }) {
  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/works/${work.id}`} className="text-xl font-bold text-rose-600 hover:text-rose-700">
            {work.title}
          </Link>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${work.type === 'serial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {work.type === 'serial' ? '连载' : '单篇'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {totalWords.toLocaleString()} 字
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              更新于 {new Date(work.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mt-3 line-clamp-2">{work.summary}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(work.tags).map(([categoryId, tags]) =>
          tags.map(tag => (
            <span key={`${categoryId}-${tag}`} className="tag">
              {tag}
            </span>
          ))
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Work } from '@/lib/types'
import { getSeriesById } from '@/lib/data'

interface WorkCardProps {
  work: Work
  showType?: boolean
  showWordCount?: boolean
  showUpdatedAt?: boolean
}

export default function WorkCard({ work, showType = true, showWordCount = true, showUpdatedAt = true }: WorkCardProps) {
  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)
  const series = work.seriesId ? getSeriesById(work.seriesId) : null

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/works/${work.id}`} className="text-xl font-medium text-emerald-900 hover:text-emerald-800">
            {work.title}
          </Link>
          <div className="flex gap-2 mt-1">
            {showType && (
              <span className={`text-xs px-2 py-0.5 rounded ${work.type === 'serial' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                {work.type === 'serial' ? '连载' : '单篇'}
              </span>
            )}
            {showWordCount && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                {totalWords.toLocaleString()} 字
              </span>
            )}
            {showUpdatedAt && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                更新于 {new Date(work.updatedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {series && (
        <div className="text-stone-500 mt-3 text-base italic">
          <span className="not-italic font-medium">「{series.name}」系列</span>
          <p className="whitespace-pre-wrap mt-1">{series.description}</p>
        </div>
      )}

      <p className="text-stone-600 mt-3 whitespace-pre-wrap">{work.summary}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {work.tags.relationship && work.tags.relationship.map(tag => (
          <span key={`relationship-${tag}`} className="px-2.5 py-1 rounded-full text-xs bg-violet-100 text-violet-800 border border-violet-300">
            {tag}
          </span>
        ))}
        {Object.entries(work.tags).filter(([categoryId]) => categoryId !== 'relationship').map(([categoryId, tags]) =>
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

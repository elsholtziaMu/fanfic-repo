import Link from 'next/link'
import { Work } from '@/lib/types'
import { getSeriesById } from '@/lib/data'
import WorkTags from '@/components/WorkTags'

interface WorkCardProps {
  work: Work
  showType?: boolean
  showWordCount?: boolean
  showUpdatedAt?: boolean
}

// 单篇作品从总览直接进入正文，跳过目录页
export function workHref(work: Work): string {
  if (work.type === 'oneshot' && work.chapters.length > 0) {
    return `/works/${encodeURIComponent(work.id)}/${encodeURIComponent(work.chapters[0].id)}`
  }
  return `/works/${encodeURIComponent(work.id)}`
}

export default function WorkCard({ work, showType = true, showWordCount = true, showUpdatedAt = true }: WorkCardProps) {
  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)
  const series = work.seriesId ? getSeriesById(work.seriesId) : null

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Link href={workHref(work)} className="text-xl font-medium text-emerald-900 hover:text-emerald-800">
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

      <WorkTags work={work} />
    </div>
  )
}

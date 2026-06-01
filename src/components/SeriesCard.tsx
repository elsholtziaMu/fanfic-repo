import Link from 'next/link'
import { Series, Work } from '@/lib/types'
import { getWorkById } from '@/lib/data'

interface SeriesCardProps {
  series: Series
  showType?: boolean
  showWordCount?: boolean
  showUpdatedAt?: boolean
}

export default function SeriesCard({ series, showType = true, showWordCount = true, showUpdatedAt = true }: SeriesCardProps) {
  const works: Work[] = series.workIds
    .map(id => getWorkById(id))
    .filter((w): w is Work => w !== undefined)

  const totalWords = works.reduce((sum, w) => sum + w.wordCount, 0)
  const latestUpdatedAt = works.length > 0
    ? works.reduce((latest, w) => w.updatedAt > latest ? w.updatedAt : latest, works[0].updatedAt)
    : null

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/series/${encodeURIComponent(series.id)}`} className="text-xl font-medium text-emerald-900 hover:text-emerald-800">
            「{series.name}」系列
          </Link>
          <div className="flex gap-2 mt-1">
            {showType && (
              <span className="text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                系列
              </span>
            )}
            {showWordCount && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                {totalWords.toLocaleString()} 字
              </span>
            )}
            {showUpdatedAt && latestUpdatedAt && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                更新于 {new Date(latestUpdatedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-stone-600 mt-3 whitespace-pre-wrap">{series.description}</p>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-stone-700 mb-2">系列作品</h4>
        <ul className="space-y-1">
          {works.map((work, index) => (
            <li key={work.id} className="flex items-baseline gap-2">
              <span className="text-emerald-700 text-sm">{index + 1}.</span>
              <Link href={`/works/${encodeURIComponent(work.id)}`} className="text-stone-700 hover:text-emerald-800">
                {work.title}
              </Link>
              <span className="text-xs text-stone-500">
                {work.type === 'serial' ? '连载' : '单篇'} · {work.wordCount.toLocaleString()} 字
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

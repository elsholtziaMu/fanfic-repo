import Link from 'next/link'
import { Series, Work } from '@/lib/types'
import { getWorkById } from '@/lib/data'
import Tag, { CATEGORY_ORDER } from '@/components/Tag'

interface SeriesCardProps {
  series: Series
  showType?: boolean
  showWordCount?: boolean
  showUpdatedAt?: boolean
}

const EXCLUDED_CATEGORIES = new Set(['status'])

function mergeTagsFromWorks(works: Work[]): [string, string[]][] {
  const merged = new Map<string, Set<string>>()

  for (const work of works) {
    for (const [category, tags] of Object.entries(work.tags)) {
      if (EXCLUDED_CATEGORIES.has(category)) continue
      if (!merged.has(category)) merged.set(category, new Set())
      tags.forEach(t => merged.get(category)!.add(t))
    }
  }

  const entries: [string, string[]][] = []
  for (const [category, tagSet] of merged) {
    entries.push([category, Array.from(tagSet)])
  }

  entries.sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a as typeof CATEGORY_ORDER[number])
    const bi = CATEGORY_ORDER.indexOf(b as typeof CATEGORY_ORDER[number])
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return entries
}

export default function SeriesCard({ series, showType = true, showWordCount = true, showUpdatedAt = true }: SeriesCardProps) {
  const works: Work[] = series.workIds
    .map(id => getWorkById(id))
    .filter((w): w is Work => w !== undefined)

  const totalWords = works.reduce((sum, w) => sum + w.wordCount, 0)
  const latestUpdatedAt = works.length > 0
    ? works.reduce((latest, w) => w.updatedAt > latest ? w.updatedAt : latest, works[0].updatedAt)
    : null

  const sortedTagEntries = mergeTagsFromWorks(works)

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

      <div className="flex flex-wrap gap-2 mt-3">
        {sortedTagEntries.map(([categoryId, tags]) =>
          tags.map(tag => (
            <Tag key={`${categoryId}-${tag}`} category={categoryId} tag={tag} />
          ))
        )}
      </div>

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

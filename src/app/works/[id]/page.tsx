import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWorkById, getSeriesById } from '@/lib/data'

interface PageProps {
  params: Promise<{ id: string }>
}



export default async function WorkDetailPage({ params }: PageProps) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const work = getWorkById(decodedId)

  if (!work) {
    notFound()
  }

  const isSeriesWork = !!work.seriesId
  const series = isSeriesWork ? getSeriesById(work.seriesId!) : null

  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-3xl font-medium text-stone-800">{work.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className={`text-sm px-3 py-1 rounded ${work.type === 'serial' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
            {work.type === 'serial' ? '连载' : '单篇'}
          </span>
          <span className="text-sm px-3 py-1 rounded bg-stone-200 text-stone-600">
            {totalWords.toLocaleString()} 字
          </span>
        </div>
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

      {series && (
        <div className="card mb-6 bg-stone-100 border-stone-300">
          <h2 className="text-lg font-medium text-stone-800 mb-2">系列：{series.name}</h2>
          <p className="text-stone-600 mb-3">{series.description}</p>
          <Link href={`/series/${series.id}`} className="text-emerald-700 hover:text-emerald-800">
            查看系列全部作品 →
          </Link>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-xl font-medium text-stone-800 mb-3">简介</h2>
        <p className="text-stone-600 whitespace-pre-wrap">{work.summary}</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-medium text-stone-800 mb-4">目录</h2>
        {work.chapters.length > 0 ? (
          <ul className="space-y-2">
            {work.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link
                  href={work.type === 'oneshot'
                    ? `/works/${work.id}/${chapter.id}`
                    : `/works/${work.id}/${chapter.id}`
                  }
                  className="text-emerald-900 hover:text-emerald-800 flex justify-between items-center"
                >
                  <span>{chapter.title}</span>
                  <span className="text-stone-400 text-sm">{chapter.wordCount.toLocaleString()}字</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">暂无章节</p>
        )}
      </div>
    </div>
  )
}

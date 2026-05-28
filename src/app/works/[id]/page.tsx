import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWorkById, getSeriesById } from '@/lib/data'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return []
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id } = await params
  const work = getWorkById(id)
  
  if (!work) {
    notFound()
  }

  const isSeriesWork = !!work.seriesId
  const series = isSeriesWork ? getSeriesById(work.seriesId!) : null

  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{work.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-sm px-3 py-1 rounded ${work.type === 'serial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {work.type === 'serial' ? '连载' : '单篇'}
          </span>
          <span className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-600">
            {totalWords.toLocaleString()} 字
          </span>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">简介</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{work.summary}</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">标签</h2>
        <div className="flex flex-wrap gap-2">
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
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold text-blue-700 mb-2">系列：{series.name}</h2>
          <p className="text-gray-600 mb-3">{series.description}</p>
          <Link href={`/series/${series.id}`} className="text-blue-600 hover:text-blue-700">
            查看系列全部作品 →
          </Link>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">目录</h2>
        {work.chapters.length > 0 ? (
          <ul className="space-y-2">
            {work.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link 
                  href={work.type === 'oneshot' 
                    ? `/works/${work.id}/${chapter.id}` 
                    : `/works/${work.id}/${chapter.id}`
                  }
                  className="text-rose-600 hover:text-rose-700 flex justify-between items-center"
                >
                  <span>{chapter.title}</span>
                  <span className="text-gray-400 text-sm">{chapter.wordCount.toLocaleString()}字</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">暂无章节</p>
        )}
      </div>
    </div>
  )
}

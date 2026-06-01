import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSeriesById, getWorkById } from '@/lib/data'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SeriesPage({ params }: PageProps) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const series = getSeriesById(decodedId)

  if (!series) {
    notFound()
  }

  const works = series.workIds.map(workId => getWorkById(workId)).filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-3xl font-medium text-stone-800">{series.name}</h1>
        {series.description && (
          <p className="text-stone-600 mt-3 whitespace-pre-wrap">{series.description}</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-medium text-stone-800 mb-4">系列作品</h2>
        {works.length > 0 ? (
          <ul className="space-y-6">
            {works.map((work, index) => (
              <li key={work!.id} className="border-b border-stone-100 pb-6 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-700 font-medium mt-1">{index + 1}.</span>
                  <div className="flex-1">
                    <Link href={`/works/${work!.id}`} className="text-emerald-900 hover:text-emerald-800">
                      <h3 className="text-lg font-medium">{work!.title}</h3>
                    </Link>
                <p className="text-stone-500 text-sm mt-1">
                  {work!.type === 'serial' ? '连载' : '单篇'} · {work!.wordCount.toLocaleString()} 字
                </p>
                <p className="text-stone-600 mt-2 whitespace-pre-wrap">{work!.summary}</p>
                      </div>
                    </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">该系列暂无作品</p>
        )}
      </div>
    </div>
  )
}
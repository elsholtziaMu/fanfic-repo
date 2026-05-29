import Link from 'next/link'
import { getWorks } from '@/lib/data'
import { getConfig } from '@/lib/data'

export default function RecommendationsPage() {
  const works = getWorks()
  const config = getConfig()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-medium text-emerald-950 mb-4">主厨推荐</h1>
      <p className="text-stone-600 mb-8">
        记得看tag啊别被创了
      </p>
      {works.length > 0 ? (
        <div className="grid gap-6">
          {works.map(work => (
            <div key={work.id} className="card">
              <Link href={`/works/${work.id}`} className="text-xl font-medium text-emerald-900 hover:text-emerald-800">
                {work.title}
              </Link>
              <p className="text-stone-600 mt-2 whitespace-pre-wrap">{work.summary}</p>
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
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-stone-500">
          暂无作品
        </div>
      )}
    </div>
  )
}

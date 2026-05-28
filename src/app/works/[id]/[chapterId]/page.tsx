import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWorkById, getSeriesById, getWorks, getCommentsByWorkId } from '@/lib/data'
import CommentSection from '@/components/CommentSection'

interface PageProps {
  params: Promise<{ id: string; chapterId?: string }>
}

export async function generateStaticParams() {
  const works = getWorks()
  const params: { id: string; chapterId?: string }[] = []
  works.forEach(work => {
    if (work.chapters.length > 0) {
      params.push({ id: work.id })
      work.chapters.forEach(ch => {
        params.push({ id: work.id, chapterId: ch.id })
      })
    } else {
      params.push({ id: work.id })
    }
  })
  return params
}

export default async function ChapterPage({ params }: PageProps) {
  const { id, chapterId } = await params
  const work = getWorkById(id)
  
  if (!work) {
    notFound()
  }

  const isOneshot = work.type === 'oneshot'
  const isSeriesWork = !!work.seriesId
  const series = isSeriesWork ? getSeriesById(work.seriesId!) : null
  const comments = getCommentsByWorkId(work.id)

  if (isOneshot) {
    const chapter = work.chapters[0]
    if (!chapter) {
      notFound()
    }
    return (
      <OneshotView work={work} chapter={chapter} comments={comments} />
    )
  }

  const currentChapter = chapterId 
    ? work.chapters.find(ch => ch.id === chapterId)
    : work.chapters[0]

  if (!currentChapter) {
    notFound()
  }

  const currentIndex = work.chapters.findIndex(ch => ch.id === currentChapter.id)
  const prevChapter = currentIndex > 0 ? work.chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < work.chapters.length - 1 ? work.chapters[currentIndex + 1] : null

  const seriesInfo = isSeriesWork && series ? getSeriesNavigation(work, series) : null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <Link href={`/works/${id}`} className="text-xl font-bold text-rose-600 hover:text-rose-700">
            {work.title}
          </Link>
          <span className="text-gray-500">第 {currentIndex + 1} / {work.chapters.length} 章</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{currentChapter.title}</h1>
      </div>

      <div className="card mb-6">
        <nav className="flex justify-center gap-4 flex-wrap">
          {prevChapter ? (
            <Link href={`/works/${id}/${prevChapter.id}`} className="btn-secondary">
              ← 上一章
            </Link>
          ) : (
            <span className="btn-secondary opacity-50 cursor-not-allowed">← 上一章</span>
          )}
          <Link href={`/works/${id}`} className="btn-secondary">
            目录
          </Link>
          {nextChapter ? (
            <Link href={`/works/${id}/${nextChapter.id}`} className="btn-secondary">
              下一章 →
            </Link>
          ) : (
            <span className="btn-secondary opacity-50 cursor-not-allowed">下一章 →</span>
          )}
        </nav>
      </div>

      {seriesInfo && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {seriesInfo.prev ? (
              <Link href={`/works/${seriesInfo.prev.id}/${seriesInfo.prev.chapterId}`} className="text-blue-600 hover:text-blue-700">
                ← {seriesInfo.prev.title}
              </Link>
            ) : (
              <span />
            )}
            <Link href={`/series/${series!.id}`} className="font-bold text-blue-700">
              {series!.name} 系列
            </Link>
            {seriesInfo.next ? (
              <Link href={`/works/${seriesInfo.next.id}/${seriesInfo.next.chapterId}`} className="text-blue-600 hover:text-blue-700">
                {seriesInfo.next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      <article className="card prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed">{currentChapter.content}</div>
      </article>

      <div className="card mt-6">
        <nav className="flex justify-center gap-4 flex-wrap">
          {prevChapter ? (
            <Link href={`/works/${id}/${prevChapter.id}`} className="btn-secondary">
              ← 上一章
            </Link>
          ) : (
            <span className="btn-secondary opacity-50 cursor-not-allowed">← 上一章</span>
          )}
          <Link href={`/works/${id}`} className="btn-secondary">
            目录
          </Link>
          {nextChapter ? (
            <Link href={`/works/${id}/${nextChapter.id}`} className="btn-secondary">
              下一章 →
            </Link>
          ) : (
            <span className="btn-secondary opacity-50 cursor-not-allowed">下一章 →</span>
          )}
        </nav>
      </div>

      {seriesInfo && (
        <div className="card mt-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {seriesInfo.prev ? (
              <Link href={`/works/${seriesInfo.prev.id}/${seriesInfo.prev.chapterId}`} className="text-blue-600 hover:text-blue-700">
                ← {seriesInfo.prev.title}
              </Link>
            ) : (
              <span />
            )}
            <Link href={`/series/${series!.id}`} className="font-bold text-blue-700">
              {series!.name} 系列
            </Link>
            {seriesInfo.next ? (
              <Link href={`/works/${seriesInfo.next.id}/${seriesInfo.next.chapterId}`} className="text-blue-600 hover:text-blue-700">
                {seriesInfo.next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      <CommentSection workId={work.id} chapterId={chapterId} comments={comments} />
    </div>
  )
}

function OneshotView({ work, chapter, comments }: { work: any; chapter: any; comments: any[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{work.title}</h1>
      </div>

      <div className="card mb-6">
        <nav className="flex justify-center gap-4 flex-wrap">
          <Link href={`/works/${work.id}`} className="btn-secondary">
            目录
          </Link>
        </nav>
      </div>

      <article className="card prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed">{chapter.content}</div>
      </article>

      <div className="card mt-6">
        <nav className="flex justify-center gap-4 flex-wrap">
          <Link href={`/works/${work.id}`} className="btn-secondary">
            目录
          </Link>
        </nav>
      </div>

      <CommentSection workId={work.id} comments={comments} />
    </div>
  )
}

function getSeriesNavigation(work: any, series: any) {
  const worksInSeries = series.workIds
    .map((id: string) => getWorkById(id))
    .filter(Boolean)
    .sort((a: any, b: any) => (a.seriesOrder || 0) - (b.seriesOrder || 0))

  const currentIndex = worksInSeries.findIndex((w: any) => w.id === work.id)
  
  return {
    prev: currentIndex > 0 ? {
      id: worksInSeries[currentIndex - 1].id,
      title: worksInSeries[currentIndex - 1].title,
      chapterId: worksInSeries[currentIndex - 1].chapters[0]?.id
    } : null,
    next: currentIndex < worksInSeries.length - 1 ? {
      id: worksInSeries[currentIndex + 1].id,
      title: worksInSeries[currentIndex + 1].title,
      chapterId: worksInSeries[currentIndex + 1].chapters[0]?.id
    } : null
  }
}

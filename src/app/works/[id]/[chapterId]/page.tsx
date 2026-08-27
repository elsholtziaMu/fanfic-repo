import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWorkById, getSeriesById } from '@/lib/data'
import { Work, Chapter, Series, Comment } from '@/lib/types'
import CommentSection from '@/components/CommentSection'
import ReadingArea from '@/components/ReadingArea'
import WorkTags from '@/components/WorkTags'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api'

async function getCommentsFromAPI(workId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${workId}`, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ id: string; chapterId?: string }>
}



const SHARED_STYLES_HREF = '/content/works-shared.css'

function SharedStylesLink() {
  return <link rel="stylesheet" href={SHARED_STYLES_HREF} />
}

function extractBody(html: string): { content: string; styles: string } {
  const styleParts: string[] = []
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match
  while ((match = styleRegex.exec(html))) {
    styleParts.push(match[1].replace(/text-decoration:\s*underline;?/gi, 'text-decoration: none;'))
  }
  const styles = styleParts.join('\n')

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    let content = bodyMatch[1]
    content = content.replace(/<header>[\s\S]*?<\/header>/i, '')
    return { content, styles }
  }
  const htmlMatch = html.match(/<html[^>]*>([\s\S]*?)<\/html>/i)
  if (htmlMatch) {
    return { content: htmlMatch[1].replace(/<head[^>]*>[\s\S]*?<\/head>/i, ''), styles }
  }
  return { content: html, styles }
}

export default async function ChapterPage({ params }: PageProps) {
  const { id, chapterId } = await params
  const decodedId = decodeURIComponent(id)
  const work = getWorkById(decodedId)

  if (!work) {
    notFound()
  }

  const isOneshot = work.type === 'oneshot'
  const isSeriesWork = !!work.seriesId
  const series = isSeriesWork ? getSeriesById(work.seriesId!) : null
  const comments = await getCommentsFromAPI(work.id)

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
    ? work.chapters.find(ch => ch.id === decodeURIComponent(chapterId))
    : work.chapters[0]

  if (!currentChapter) {
    notFound()
  }

  const currentIndex = work.chapters.findIndex(ch => ch.id === currentChapter.id)
  const prevChapter = currentIndex > 0 ? work.chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < work.chapters.length - 1 ? work.chapters[currentIndex + 1] : null

  const seriesInfo = isSeriesWork && series ? getSeriesNavigation(work, series) : null

  const bodyContent = extractBody(currentChapter.content)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <Link href={`/works/${id}`} className="text-xl font-medium text-emerald-900 hover:text-emerald-800">
            {work.title}
          </Link>
          <span className="text-stone-500">第 {currentIndex + 1} / {work.chapters.length} 章</span>
        </div>
        <h1 className="text-2xl font-medium text-stone-800 mt-2">{currentChapter.title}</h1>
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
        <div className="card mb-6 bg-stone-100 border-stone-300">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="justify-self-start">
              {seriesInfo.prev ? (
                <Link href={`/works/${seriesInfo.prev.id}`} className="text-emerald-700 hover:text-emerald-800">
                  ← {seriesInfo.prev.title}
                </Link>
              ) : null}
            </div>
            <Link href={`/series/${series!.id}`} className="font-medium text-emerald-900">
              {series!.name} 系列
            </Link>
            <div className="justify-self-end">
              {seriesInfo.next ? (
                <Link href={`/works/${seriesInfo.next.id}`} className="text-emerald-700 hover:text-emerald-800">
                  {seriesInfo.next.title} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <ReadingArea>
        <article className="card">
          <SharedStylesLink />
          {bodyContent.styles && (
            <style dangerouslySetInnerHTML={{ __html: bodyContent.styles }} />
          )}
          {currentChapter.warning && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400">
              <p className="text-amber-800 whitespace-pre-wrap">{currentChapter.warning}</p>
            </div>
          )}
          {currentChapter.beginNote && (
            <div className="mb-6 p-4 bg-stone-100 border-l-4 border-stone-400">
              <p className="text-stone-700 whitespace-pre-wrap">{currentChapter.beginNote}</p>
            </div>
          )}

          <div
            className="prose prose-stone max-w-none px-6 py-12"
            dangerouslySetInnerHTML={{ __html: bodyContent.content }}
          />

          {currentChapter.endNote && (
            <div className="mt-6 p-4 bg-stone-100 border-l-4 border-stone-400">
              <h3 className="text-sm font-medium text-stone-600 mb-2">后记</h3>
              <p className="text-stone-700 whitespace-pre-wrap">{currentChapter.endNote}</p>
            </div>
          )}
        </article>
      </ReadingArea>

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
        <div className="card mt-6 bg-stone-100 border-stone-300">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="justify-self-start">
              {seriesInfo.prev ? (
                <Link href={`/works/${seriesInfo.prev.id}`} className="text-emerald-700 hover:text-emerald-800">
                  ← {seriesInfo.prev.title}
                </Link>
              ) : null}
            </div>
            <Link href={`/series/${series!.id}`} className="font-medium text-emerald-900">
              {series!.name} 系列
            </Link>
            <div className="justify-self-end">
              {seriesInfo.next ? (
                <Link href={`/works/${seriesInfo.next.id}`} className="text-emerald-700 hover:text-emerald-800">
                  {seriesInfo.next.title} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <CommentSection workId={work.id} chapterId={chapterId} initialComments={comments} />
    </div>
  )
}

function OneshotView({ work, chapter, comments }: { work: Work; chapter: Chapter; comments: Comment[] }) {
  const bodyContent = extractBody(chapter.content)
  const totalWords = work.chapters.reduce((sum, ch) => sum + ch.wordCount, 0)
  const statusTag = work.tags.status && work.tags.status.length > 0 ? work.tags.status[0] : null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-medium text-stone-800">{work.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          {statusTag && (
            <span className="text-sm px-3 py-1 rounded bg-amber-100 text-amber-800 border border-amber-400">
              {statusTag}
            </span>
          )}
          <span className="text-sm px-3 py-1 rounded bg-stone-200 text-stone-600">
            {totalWords.toLocaleString()} 字
          </span>
        </div>
        <WorkTags work={work} hideCategories={['status']} />
      </div>

      {work.summary && (
        <div className="card mb-6">
          <p className="text-stone-600 whitespace-pre-wrap">{work.summary}</p>
        </div>
      )}

      {chapter.beginNote && (
        <div className="card mb-6 p-4 bg-stone-100 border-l-4 border-stone-400">
          <p className="text-stone-700 whitespace-pre-wrap">{chapter.beginNote}</p>
        </div>
      )}

      <ReadingArea>
        <article className="card">
          <SharedStylesLink />
          {bodyContent.styles && (
            <style dangerouslySetInnerHTML={{ __html: bodyContent.styles }} />
          )}
          {chapter.warning && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400">
              <p className="text-amber-800 whitespace-pre-wrap">{chapter.warning}</p>
            </div>
          )}

          <div
            className="prose prose-stone max-w-none px-6 py-12"
            dangerouslySetInnerHTML={{ __html: bodyContent.content }}
          />

          {chapter.endNote && (
            <div className="mt-6 p-4 bg-stone-100 border-l-4 border-stone-400">
              <h3 className="text-sm font-medium text-stone-600 mb-2">后记</h3>
              <p className="text-stone-700 whitespace-pre-wrap">{chapter.endNote}</p>
            </div>
          )}
        </article>
      </ReadingArea>

      <CommentSection workId={work.id} initialComments={comments} />
    </div>
  )
}

function getSeriesNavigation(work: Work, series: Series) {
  const worksInSeries = series.workIds
    .map(id => getWorkById(id))
    .filter((w): w is Work => w !== undefined)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))

  const currentIndex = worksInSeries.findIndex(w => w.id === work.id)

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

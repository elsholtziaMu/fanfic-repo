import { Work, Series } from '@/lib/types'
import { getRecommendations, getWorkById, getSeriesById } from '@/lib/data'
import WorkCard from '@/components/WorkCard'
import SeriesCard from '@/components/SeriesCard'

type WorkRecommendationItem = {
  type: 'work'
  work: Work
  title: string
  blurb: string
}

type SeriesRecommendationItem = {
  type: 'series'
  series: Series
  title: string
  blurb: string
}

type RecommendationItem = WorkRecommendationItem | SeriesRecommendationItem

export default function RecommendationsPage() {
  const recommendations = getRecommendations()
  const items: RecommendationItem[] = recommendations
    .map((r): RecommendationItem | null => {
      if (r.type === 'series') {
        const series = getSeriesById(r.seriesId)
        return series ? { type: 'series', series, title: r.title, blurb: r.blurb } : null
      }
      const work = getWorkById(r.workId)
      return work ? { type: 'work', work, title: r.title, blurb: r.blurb } : null
    })
    .filter((item): item is RecommendationItem => item !== null)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-medium text-emerald-950 mb-4">推荐</h1>
      <p className="text-stone-600 mb-8">
        点进作品界面后请注意查看 tag 以及预警，以防踩雷。<br />
        祝吃好喝好！
      </p>
      {items.length > 0 ? (
        <div className="grid gap-12">
          {items.map((item) => (
            <div key={item.type === 'series' ? item.series.id : item.work.id}>
              <div className="text-stone-700 italic bg-stone-200/60 border-l-4 border-emerald-700 pl-4 py-2 pr-4 rounded-r mb-4 whitespace-pre-wrap">
                <div className="not-italic font-bold">「{item.title}」</div>
                <div>{item.blurb}</div>
              </div>
              {item.type === 'series' ? (
                <SeriesCard series={item.series} showType={false} showWordCount={false} />
              ) : (
                <WorkCard work={item.work} showType={false} showWordCount={false} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-stone-500">
          暂无推荐
        </div>
      )}
    </div>
  )
}

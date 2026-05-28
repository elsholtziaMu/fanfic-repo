import { getConfig } from '@/lib/data'
import Link from 'next/link'

export default function HomePage() {
  const config = getConfig()

  return (
    <div className="space-y-8">
      <section className="card bg-rose-50 border-rose-200">
        <h2 className="text-xl font-bold text-rose-700 mb-3">📢 公告</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{config.announcement}</p>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">欢迎来到 {config.title}</h2>
        <p className="text-gray-600 mb-6">{config.subtitle}</p>
        <div className="flex gap-4">
          <Link href="/works" className="btn-primary">
            浏览作品
          </Link>
          <Link href="/about" className="btn-secondary">
            关于我
          </Link>
        </div>
      </section>

      <section className="card bg-amber-50 border-amber-200">
        <h2 className="text-lg font-bold text-amber-800 mb-2">⚠️ 免责声明</h2>
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{config.disclaimer}</p>
      </section>
    </div>
  )
}

import { getConfig } from '@/lib/data'
import Link from 'next/link'

export default function HomePage() {
  const config = getConfig()

  return (
    <div className="space-y-8">
      <section className="card border-l-4 border-emerald-800 bg-stone-100">
        <h2 className="text-xl font-medium text-emerald-950 mb-3">公告</h2>
        <p className="text-stone-700 whitespace-pre-wrap">{config.announcement}</p>
      </section>

      <section className="card">
        <h2 className="text-xl font-medium text-stone-800 mb-4">欢迎来到 {config.title}</h2>
        <p className="text-gray-600">匿名提问箱：
              <a href="https://www.pome.vip/oCLtbu57" target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:text-emerald-700">
                POME
              </a> 
        </p>
        <p className="text-stone-600 mb-6">{config.subtitle}</p>
        <div className="flex flex-col gap-4">
          <Link href="/recommendations" className="btn-primary text-center">
            推荐
          </Link>
          <Link href="/works" className="btn-secondary text-center">
            作品总览
          </Link>
          <Link href="/about" className="btn-secondary text-center">
            关于我
          </Link>
        </div>
      </section>

      <section className="card border-l-4 border-stone-400">
        <h2 className="text-lg font-medium text-stone-700 mb-2">免责声明</h2>
        <p className="text-stone-600 text-sm whitespace-pre-wrap">{config.disclaimer}</p>
      </section>
    </div>
  )
}

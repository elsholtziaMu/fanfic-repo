import { getConfig } from '@/lib/data'
import Link from 'next/link'

export default function AboutPage() {
  const config = getConfig()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">关于我</h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-2">作者信息</h2>
            <p className="text-gray-600">昵称：{config.authorName}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-2">写作方向</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              这里可以写你的写作方向、喜欢的CP、创作理念等内容。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-2">联系方式</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              这里可以写你的联系方式、社交账号等。
            </p>
          </section>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/works" className="btn-primary">
          返回作品总览
        </Link>
      </div>
    </div>
  )
}

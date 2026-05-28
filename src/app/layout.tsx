import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getConfig } from '@/lib/data'

export const metadata: Metadata = {
  title: '同人作品站',
  description: '同人小说存放站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = getConfig()

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-rose-600">
                {config.title}
              </Link>
              <div className="flex gap-6">
                <Link href="/works" className="text-gray-700 hover:text-rose-600 transition-colors">
                  作品总览
                </Link>
                <Link href="/authors" className="text-gray-700 hover:text-rose-600 transition-colors">
                  文手推荐
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-rose-600 transition-colors">
                  关于我
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            <p>{config.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

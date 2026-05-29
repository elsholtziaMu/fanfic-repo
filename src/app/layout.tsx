import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getConfig } from '@/lib/data'

export const metadata: Metadata = {
  title: '木的粮仓',
  description: 'Mu\'s Barn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = getConfig()

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-stone-100">
        <header className="bg-stone-200/80 border-b border-stone-300">
          <nav className="max-w-6xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-medium text-emerald-950 tracking-wide">
                {config.title}
              </Link>
              <div className="flex gap-8">
                <Link href="/works" className="text-stone-700 hover:text-emerald-900 transition-colors">
                  作品总览
                </Link>
                <Link href="/authors" className="text-stone-700 hover:text-emerald-900 transition-colors">
                  主厨推荐
                </Link>
                <Link href="/about" className="text-stone-700 hover:text-emerald-900 transition-colors">
                  关于我
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-10">
          {children}
        </main>
        <footer className="bg-stone-200 border-t border-stone-300 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-stone-500 text-sm">
            <p>{config.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

import Link from 'next/link'
import { getAuthors } from '@/lib/data'

export default function AuthorsPage() {
  const authors = getAuthors()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">文手推荐</h1>
      <p className="text-gray-600 mb-8">
        这里推荐一些喜欢的文手/作者，排名不分先后。
      </p>
      {authors.length > 0 ? (
        <div className="grid gap-6">
          {authors.map(author => (
            <div key={author.id} className="card">
              <h2 className="text-xl font-bold text-gray-800">{author.name}</h2>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{author.description}</p>
              {author.link && (
                <a 
                  href={author.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-700 mt-2 inline-block"
                >
                  访问主页 →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          暂无推荐文手
        </div>
      )}
    </div>
  )
}

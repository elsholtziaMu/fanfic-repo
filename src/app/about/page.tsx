import { getConfig } from '@/lib/data'
import Link from 'next/link'

export default function AboutPage() {
  const config = getConfig()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">关于我</h1>
        <div className="space-y-8">
          <section>
            <p className="text-gray-600 whitespace-pre-wrap">
              超绝杂食人。程度大概就是可以接受AB做到一半B突然爬起来把A入了，且AB性别不限。<br />
              嗯其实就是我根本不在意谁左谁右，我们小深总（和他的各种形态）爽就行。<br />
              虽然非常混乱邪恶但是tag还是会好好打的，没有想创死任何人的意思。
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-2">其他平台</h2>
            <p className="text-gray-600">Archive of Our Own：
              <a href="https://archiveofourown.org/users/Elsholtzia_Mu" target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:text-emerald-700">
                Elsholtzia_Mu
              </a> 
              &nbsp;&nbsp;(需要登录)
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-2">联系方式</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              邮箱：elsholtzia.mu@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

import { Work } from '@/lib/types'
import Tag, { CATEGORY_ORDER } from '@/components/Tag'

interface WorkTagsProps {
  work: Work
  /** 需要从陈列中排除的分类（如已在别处以大徽章形式展示的 status） */
  hideCategories?: string[]
}

// 作品 Tag 陈列：与作品总览完全同源——Tag 组件按分类配色 + CATEGORY_ORDER 排序
export default function WorkTags({ work, hideCategories = [] }: WorkTagsProps) {
  const sortedTagEntries = Object.entries(work.tags).sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a as typeof CATEGORY_ORDER[number])
    const bi = CATEGORY_ORDER.indexOf(b as typeof CATEGORY_ORDER[number])
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {sortedTagEntries.map(([categoryId, tags]) =>
        hideCategories.includes(categoryId)
          ? null
          : tags.map(tag => <Tag key={`${categoryId}-${tag}`} category={categoryId} tag={tag} />)
      )}
    </div>
  )
}

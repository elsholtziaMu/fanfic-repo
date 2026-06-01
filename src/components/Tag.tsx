interface TagProps {
  category: string
  tag: string
}

export const CATEGORY_ORDER = [
  'relationship',
  'au',
  'cp_type',
  'attribute',
  'main_char',
  'relationship-type',
  'status',
  'rating',
] as const

const CATEGORY_STYLES: Record<string, string> = {
  relationship: 'px-2.5 py-1 rounded-full text-xs bg-violet-100 text-violet-800 border border-violet-300',
  rating: 'px-2.5 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-300',
  status: 'px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-400',
  au: 'px-2.5 py-1 rounded-full text-xs bg-stone-200 text-stone-700 border border-stone-400',
  cp_type: 'px-2.5 py-1 rounded-full text-xs bg-sky-100 text-sky-800 border border-sky-300',
  attribute: 'px-2.5 py-1 rounded-full text-xs bg-teal-100/80 text-teal-800 border border-teal-300',
}

const DEFAULT_STYLE = 'px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-900 border border-emerald-200'

export default function Tag({ category, tag }: TagProps) {
  const className = CATEGORY_STYLES[category] || DEFAULT_STYLE
  return <span className={className}>{tag}</span>
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-violet-100', 'text-violet-800', 'border-violet-300',
    'bg-orange-100', 'text-orange-800', 'border-orange-300',
    'bg-amber-100', 'text-amber-800', 'border-amber-400',
    'bg-stone-200', 'text-stone-700', 'border-stone-400',
    'bg-emerald-50', 'text-emerald-900', 'border-emerald-200',
    'bg-sky-100', 'text-sky-800', 'border-sky-300',
    'bg-teal-100', 'text-teal-800', 'border-teal-300',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config

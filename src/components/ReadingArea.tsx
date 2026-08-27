'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const FONT_MIN = 14
const FONT_MAX = 30
const FONT_STEP = 2
const LINE_MIN = 1.4
const LINE_MAX = 2.8
const LINE_STEP = 0.1

// SSR 与客户端首次渲染使用相同默认值，localStorage 在挂载后恢复
const DEFAULTS = { fontSize: 18, lineHeight: 1.5 }
const STORAGE_KEY = 'fanfic-reader-settings'

type Settings = typeof DEFAULTS

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function ReadingArea({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      setSettings({
        fontSize: clamp(Number(saved.fontSize) || DEFAULTS.fontSize, FONT_MIN, FONT_MAX),
        lineHeight: clamp(Number(saved.lineHeight) || DEFAULTS.lineHeight, LINE_MIN, LINE_MAX),
      })
    } catch {
      // 忽略损坏的本地存储数据
    }
  }, [])

  const apply = (next: Settings) => {
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 无痕模式等场景下写入失败可接受
    }
  }

  const reset = () => {
    setSettings(DEFAULTS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 忽略
    }
  }

  const stepFont = (delta: number) =>
    apply({ ...settings, fontSize: clamp(settings.fontSize + delta, FONT_MIN, FONT_MAX) })
  const stepLine = (delta: number) =>
    apply({
      ...settings,
      lineHeight: Math.round(clamp(settings.lineHeight + delta, LINE_MIN, LINE_MAX) * 10) / 10,
    })

  const style = {
    '--reader-font-size': `${settings.fontSize}px`,
    '--reader-line-height': `${settings.lineHeight}`,
  } as CSSProperties

  return (
    <div className="reading-root" style={style}>
      <div className="mb-3 flex justify-end gap-6 text-sm text-stone-500">
        <span className="flex items-center gap-1.5">
          字号
          <button onClick={() => stepFont(-FONT_STEP)} className="btn-secondary !px-2.5 !py-0.5" aria-label="减小字号">
            A－
          </button>
          <span className="w-7 text-center tabular-nums">{settings.fontSize}</span>
          <button onClick={() => stepFont(FONT_STEP)} className="btn-secondary !px-2.5 !py-0.5" aria-label="增大字号">
            A＋
          </button>
        </span>
        <span className="flex items-center gap-1.5">
          行距
          <button onClick={() => stepLine(-LINE_STEP)} className="btn-secondary !px-2.5 !py-0.5" aria-label="减小行距">
            －
          </button>
          <span className="w-9 text-center tabular-nums">{settings.lineHeight.toFixed(1)}</span>
          <button onClick={() => stepLine(LINE_STEP)} className="btn-secondary !px-2.5 !py-0.5" aria-label="增大行距">
            ＋
          </button>
        </span>
        <button onClick={reset} className="hover:text-stone-700 underline-offset-2 hover:underline" title="恢复默认字号与行距">
          重置
        </button>
      </div>
      {children}
    </div>
  )
}

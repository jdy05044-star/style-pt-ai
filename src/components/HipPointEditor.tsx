import { useState, type MouseEvent } from 'react'
import type { ManualHipPoints } from '@/types'

interface Props {
  imageDataUrl: string
  value: ManualHipPoints
  onChange: (next: ManualHipPoints) => void
}

type PointKey = keyof ManualHipPoints

const POINT_ORDER: { key: PointKey; label: string }[] = [
  { key: 'left', label: '골반 왼쪽 (가장 넓은 지점)' },
  { key: 'right', label: '골반 오른쪽 (가장 넓은 지점)' }
]

/**
 * MediaPipe hip landmark(23/24번)는 고관절 위치라서, 눈으로 보이는 골반뼈 중 가장 넓은
 * 지점(바지 골반라인이 걸리는 지점)보다 안쪽으로 잡히는 경우가 많다. 그래서 허리와 같은
 * 방식으로, 사용자가 직접 사진 위에서 골반이 가장 넓어 보이는 좌우 지점을 탭해 표시하면
 * 그 값을 landmark 기반 근사치보다 우선해서 사용한다.
 */
export default function HipPointEditor({ imageDataUrl, value, onChange }: Props) {
  const [activeKey, setActiveKey] = useState<PointKey | null>(null)

  const handleTap = (e: MouseEvent<HTMLDivElement>) => {
    if (!activeKey) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    const next = { ...value, [activeKey]: { x, y } }
    onChange(next)
    const nextUnset = POINT_ORDER.find((p) => !next[p.key])
    setActiveKey(nextUnset ? nextUnset.key : null)
  }

  const handleReset = () => {
    onChange({})
    setActiveKey(POINT_ORDER[0].key)
  }

  const placedCount = POINT_ORDER.filter((p) => !!value[p.key]).length

  return (
    <div>
      <p className="mb-2 text-xs text-studio-500">
        골반 관절 자동 인식은 실제 골반 폭보다 좁게 잡힐 수 있어요. 아래 버튼을 선택한 뒤, 사진 위 골반뼈가 가장
        넓어 보이는(바지 골반라인이 걸리는) 좌우 지점을 직접 탭해주세요.
      </p>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {POINT_ORDER.map((p) => {
          const isSet = !!value[p.key]
          const isActive = activeKey === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveKey(p.key)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-studio-700 bg-studio-700 text-white'
                  : isSet
                    ? 'border-studio-300 bg-studio-100 text-studio-700'
                    : 'border-studio-200 bg-white text-studio-500'
              }`}
            >
              {isSet ? '✓ ' : ''}
              {p.label}
            </button>
          )
        })}
      </div>

      {activeKey && (
        <p className="mb-2 text-xs font-medium text-alert-amber">
          "{POINT_ORDER.find((p) => p.key === activeKey)?.label}" 위치를 사진에서 탭해주세요
        </p>
      )}

      <div
        className={`relative overflow-hidden rounded-lg border border-studio-200 bg-studio-50 ${
          activeKey ? 'cursor-crosshair' : ''
        }`}
        onClick={handleTap}
      >
        <img src={imageDataUrl} alt="정면 사진 — 골반 지점 표시" className="block w-full select-none" />
        {POINT_ORDER.map((p) => {
          const pt = value[p.key]
          if (!pt) return null
          return (
            <div
              key={p.key}
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
            >
              <span className="h-3 w-3 rounded-full border-2 border-white bg-studio-700 shadow" />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-studio-500">{placedCount} / {POINT_ORDER.length}개 지점 표시됨</p>
        <button type="button" onClick={handleReset} className="text-xs font-medium text-studio-500 underline">
          초기화
        </button>
      </div>
    </div>
  )
}

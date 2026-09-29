import { useState, type MouseEvent } from 'react'
import type { ManualWaistPoints } from '@/types'

interface Props {
  imageDataUrl: string
  value: ManualWaistPoints
  onChange: (next: ManualWaistPoints) => void
}

type PointKey = keyof ManualWaistPoints

const POINT_ORDER: { key: PointKey; label: string }[] = [
  { key: 'left', label: '허리 왼쪽' },
  { key: 'right', label: '허리 오른쪽' }
]

/**
 * MediaPipe Pose는 관절 중심점만 제공하고 허리 지점은 제공하지 않는다. 그래서 posture-pt-ai의
 * ManualSideLandmarkEditor와 같은 방식으로, 사진 위에서 사용자가 직접 허리가 가장 잘록해
 * 보이는 좌우 지점을 탭해서 표시하게 한다. 표시하지 않으면 허리 관련 지표(WHR·허리 굴곡 등)는
 * "측정 불확실"로 남는다 — 값을 지어내지 않는다.
 */
export default function WaistPointEditor({ imageDataUrl, value, onChange }: Props) {
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
        허리 너비는 자동으로 인식하기 어려운 지점이라, 아래 버튼을 선택한 뒤 사진 위 허리가 가장 잘록해 보이는
        좌우 위치를 직접 탭해주세요. 표시하지 않아도 어깨·골반 기준 분석은 그대로 진행되며, 허리 관련 지표만
        더 정확해집니다.
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
        <img src={imageDataUrl} alt="정면 사진 — 허리 지점 표시" className="block w-full select-none" />
        {POINT_ORDER.map((p) => {
          const pt = value[p.key]
          if (!pt) return null
          return (
            <div
              key={p.key}
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
            >
              <span className="h-3 w-3 rounded-full border-2 border-white bg-alert-amber shadow" />
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

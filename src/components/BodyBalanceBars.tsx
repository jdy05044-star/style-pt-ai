import type { BodyMeasurements } from '@/types'

interface Props {
  measurements: BodyMeasurements
}

/**
 * 어깨·허리·골반의 상대적인 폭을 막대 길이로 보여주는 간단한 원본 그래프.
 * 실제 cm 치수가 아니라 셋 중 가장 넓은 값을 100으로 둔 상대 비율이며, 허리는 사용자가
 * 직접 지점을 표시했을 때만 표시된다(측정하지 않았으면 막대 자체를 그리지 않음).
 */
export default function BodyBalanceBars({ measurements: m }: Props) {
  const rows: { label: string; px: number | null }[] = [
    { label: '어깨', px: m.shoulderWidthPx },
    { label: '허리', px: m.waistWidthPx },
    { label: '골반', px: m.hipWidthPx }
  ]
  const known = rows.filter((r) => r.px != null).map((r) => r.px as number)
  if (known.length === 0) return null
  const max = Math.max(...known)

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-8 flex-none text-xs text-studio-500">{r.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-studio-100">
            {r.px != null && (
              <div
                className="h-full rounded-full bg-studio-500"
                style={{ width: `${Math.max(6, Math.round((r.px / max) * 100))}%` }}
              />
            )}
          </div>
          {r.px == null && <span className="w-16 flex-none text-right text-[10px] text-studio-400">측정 불확실</span>}
        </div>
      ))}
    </div>
  )
}

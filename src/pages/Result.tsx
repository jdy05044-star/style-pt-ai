import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeBodyMeasurements } from '@/assessment/bodyMeasurements'
import { computeBodyProfile } from '@/assessment/bodyShape'
import { computeRecommendations, topPicksByCategory } from '@/assessment/recommendationEngine'
import BodyBalanceBars from '@/components/BodyBalanceBars'
import WaistPointEditor from '@/components/WaistPointEditor'
import {
  BODY_SHAPE_LABELS,
  CATEGORY_LABELS,
  MATCH_TIER_LABELS,
  STYLE_GOAL_LABELS,
  type MatchTier
} from '@/types'
import { useAppState } from '@/state/AppState'

const TIER_COLOR: Record<MatchTier, string> = {
  strong: 'bg-studio-700 text-white',
  good: 'bg-studio-300 text-studio-900',
  neutral: 'bg-studio-100 text-studio-700',
  less: 'bg-white text-studio-400 border border-studio-200'
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="mb-3 mt-8 text-base font-semibold text-studio-900 first:mt-0">{title}</h2>
}

export default function Result() {
  const { captures, results, waistPoints, setWaistPoints, styleGoals } = useAppState()
  const navigate = useNavigate()

  const measurements = useMemo(
    () => computeBodyMeasurements(results.front ?? null, waistPoints),
    [results.front, waistPoints]
  )
  const profile = useMemo(() => computeBodyProfile(measurements), [measurements])
  const recommendations = useMemo(() => computeRecommendations(profile, styleGoals), [profile, styleGoals])
  const topPicks = useMemo(() => topPicksByCategory(recommendations), [recommendations])

  if (!captures.front || !results.front) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <p className="text-sm text-studio-600">아직 분석된 사진이 없습니다.</p>
        <button onClick={() => navigate('/capture')} className="btn-primary mt-4 w-full py-3">
          사진 촬영으로 이동
        </button>
      </div>
    )
  }

  if (results.front.landmarks.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <p className="text-sm text-studio-600">
          분석 데이터 부족 — 사진에서 사람을 인식하지 못했습니다. 전신이 프레임 안에 들어오는 사진으로 다시
          시도해주세요.
        </p>
        <button onClick={() => navigate('/capture')} className="btn-primary mt-4 w-full py-3">
          다시 촬영하기
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h2 className="mb-1 text-lg font-semibold text-studio-900">체형 분석 & 스타일 추천 결과</h2>
      <p className="mb-6 text-sm text-studio-600">
        아래 내용은 사진 기반 참고 정보이며, 체형을 "이거다"라고 단정하지 않습니다. 정확도는 촬영 조건에 따라
        달라질 수 있어요.
      </p>

      <SectionHeader title="체형 분석" />
      <div className="card mb-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-medium text-studio-800">{BODY_SHAPE_LABELS[profile.primaryShape]}</p>
          <span className="flex-none rounded-full bg-studio-100 px-2 py-0.5 text-[10px] font-medium text-studio-500">
            {profile.confidence === 'high' ? '신뢰도 높음' : profile.confidence === 'moderate' ? '신뢰도 보통' : '신뢰도 낮음'}
          </span>
        </div>

        <BodyBalanceBars measurements={measurements} />

        <ul className="mt-3 space-y-1 text-xs text-studio-500">
          {profile.basis.map((b) => (
            <li key={b}>· {b}</li>
          ))}
        </ul>

        <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-studio-600">
          {profile.shoulderVsHip && <p>어깨·골반: {profile.shoulderVsHip}</p>}
          <p>허리 라인: {profile.waistDefinition}</p>
          {profile.upperLowerBalance && <p>상하체 비율: {profile.upperLowerBalance}</p>}
        </div>

        {measurements.waistWidthPx == null && (
          <div className="mt-4 border-t border-studio-100 pt-3">
            <p className="label-caption mb-2">허리 지점을 표시하면 더 정확해져요</p>
            <WaistPointEditor imageDataUrl={captures.front.dataUrl} value={waistPoints} onChange={setWaistPoints} />
          </div>
        )}

        <p className="mt-3 text-xs text-studio-400">
          체형은 사진 한 장 기준의 참고용 분류이며, 카메라 거리·자세·옷차림에 따라 오차가 있을 수 있습니다.
        </p>
      </div>

      <SectionHeader title="스타일 추천 요약" />
      {styleGoals.length > 0 && (
        <p className="mb-3 text-xs text-studio-500">
          선택한 스타일 방향: {styleGoals.map((g) => STYLE_GOAL_LABELS[g]).join(', ')}
        </p>
      )}
      <div className="mb-4 space-y-3">
        {topPicks.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="label-caption">{CATEGORY_LABELS[p.category]}</p>
              <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-medium ${TIER_COLOR[p.tier]}`}>
                {MATCH_TIER_LABELS[p.tier]} · {p.score}%
              </span>
            </div>
            <p className="mb-1 font-medium text-studio-800">{p.name}</p>
            <p className="text-sm text-studio-600">{p.reason}</p>
            {p.alternative && <p className="mt-1 text-xs text-studio-400">대안: {p.alternative}</p>}
          </div>
        ))}
      </div>

      <SectionHeader title="카테고리별 전체 적합도" />
      <div className="space-y-4">
        {(['neckline', 'sleeve', 'topLength', 'bottom', 'dress', 'outerwear'] as const).map((cat) => {
          const items = recommendations.filter((r) => r.category === cat).sort((a, b) => b.score - a.score)
          return (
            <div key={cat} className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-studio-900">{CATEGORY_LABELS[cat]}</h3>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-studio-700">{it.name}</span>
                    <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-medium ${TIER_COLOR[it.tier]}`}>
                      {it.score}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <p className="mt-6 border-t border-studio-100 pt-4 text-xs text-studio-400">
        이 추천은 일반적인 스타일링 참고 정보이며, 실제 구매·코디 결정을 대신하지 않습니다. "Less Recommended"는
        "착용 금지"가 아니라 현재 선택한 체형 신호·스타일 목표와 상대적으로 덜 맞는다는 의미입니다.
      </p>

      <button onClick={() => navigate('/goals')} className="btn-secondary mt-6 w-full py-3">
        스타일 목표 다시 선택
      </button>
    </div>
  )
}

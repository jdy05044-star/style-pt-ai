import { useNavigate } from 'react-router-dom'
import { STYLE_GOAL_LABELS, STYLE_GOAL_OPTIONS, type StyleGoal } from '@/types'
import { useAppState } from '@/state/AppState'

export default function Goals() {
  const { styleGoals, setStyleGoals, captures } = useAppState()
  const navigate = useNavigate()

  function toggle(g: StyleGoal) {
    setStyleGoals(styleGoals.includes(g) ? styleGoals.filter((x) => x !== g) : [...styleGoals, g])
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h2 className="mb-1 text-lg font-semibold text-studio-900">원하는 스타일 방향</h2>
      <p className="mb-6 text-sm text-studio-600">
        원하는 만큼 여러 개 선택할 수 있어요. 선택한 항목은 추천 결과의 점수에 반영됩니다.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {STYLE_GOAL_OPTIONS.map((g) => {
          const active = styleGoals.includes(g)
          return (
            <button
              key={g}
              onClick={() => toggle(g)}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'border-studio-700 bg-studio-700 text-white' : 'border-studio-200 bg-white text-studio-600'
              }`}
            >
              {STYLE_GOAL_LABELS[g]}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/result')}
        disabled={!captures.front}
        className="btn-primary w-full py-4 text-base"
      >
        결과 보기
      </button>
      {styleGoals.length === 0 && (
        <p className="mt-2 text-center text-xs text-studio-400">선택하지 않아도 체형 기반 추천은 보여드려요.</p>
      )}
    </div>
  )
}

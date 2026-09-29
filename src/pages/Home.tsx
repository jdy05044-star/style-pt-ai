import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-studio-900">체형 분석 & 스타일 추천</h1>
      <p className="mb-6 text-sm text-studio-600">
        정면 사진 한 장으로 어깨·허리·골반의 상대적인 비율을 분석하고, 원하는 스타일 방향에 맞는 옷의
        넥라인·소매·기장·실루엣을 참고용으로 추천해드려요.
      </p>

      <div className="card mb-6 p-4">
        <p className="label-caption mb-2">이렇게 진행돼요</p>
        <ol className="space-y-2 text-sm text-studio-700">
          <li>1. 전신 사진 촬영/업로드</li>
          <li>2. (선택) 허리 위치 직접 표시 — 더 정확한 분석을 위해</li>
          <li>3. 원하는 스타일 방향 선택</li>
          <li>4. 체형 분석 + 스타일 추천 결과 확인</li>
        </ol>
      </div>

      <div className="mb-6 rounded-lg bg-studio-100 p-3 text-xs text-studio-600">
        이 앱의 분석·추천은 사진 기반의 참고 정보이며, 특정 체형이 "맞다/틀리다"를 판정하지 않습니다. 카메라
        각도·조명·옷차림에 따라 오차가 있을 수 있어요.
      </div>

      <button onClick={() => navigate('/capture')} className="btn-primary w-full py-4 text-base">
        시작하기
      </button>
    </div>
  )
}

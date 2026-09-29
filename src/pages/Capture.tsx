import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzePose } from '@/lib/poseLandmarker'
import PhotoCapture from '@/components/PhotoCapture'
import WaistPointEditor from '@/components/WaistPointEditor'
import { useAppState } from '@/state/AppState'

export default function Capture() {
  const { captures, setCapture, setResult, waistPoints, setWaistPoints } = useAppState()
  const navigate = useNavigate()
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!captures.front) return
    setAnalyzing(true)
    setError(null)
    try {
      const frontResult = await analyzePose('front', captures.front.dataUrl)
      setResult('front', frontResult)
      if (frontResult.landmarks.length === 0) {
        setError('사진에서 사람을 인식하지 못했습니다. 전신이 프레임 안에 잘 들어오는 사진으로 다시 시도해주세요.')
        setAnalyzing(false)
        return
      }
      if (captures.side) {
        const sideResult = await analyzePose('side', captures.side.dataUrl)
        setResult('side', sideResult)
      }
      navigate('/goals')
    } catch (_e) {
      setError('분석 모델을 불러오지 못했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h2 className="mb-1 text-lg font-semibold text-studio-900">사진 준비</h2>
      <p className="mb-6 text-sm text-studio-600">정면 사진은 필수, 측면 사진은 선택입니다.</p>

      <div className="mb-4">
        <PhotoCapture view="front" value={captures.front ?? null} onChange={(img) => setCapture('front', img)} />
      </div>

      {captures.front && (
        <div className="card mb-4 p-4">
          <h3 className="mb-1 text-sm font-semibold text-studio-900">허리 위치 직접 표시 (선택)</h3>
          <WaistPointEditor imageDataUrl={captures.front.dataUrl} value={waistPoints} onChange={setWaistPoints} />
        </div>
      )}

      <div className="mb-6">
        <PhotoCapture view="side" value={captures.side ?? null} onChange={(img) => setCapture('side', img)} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-alert-red/10 p-3 text-sm text-alert-red">{error}</div>
      )}

      <button
        onClick={handleContinue}
        disabled={!captures.front || analyzing}
        className="btn-primary w-full py-4 text-base"
      >
        {analyzing ? '분석 중…' : '다음: 스타일 목표 선택'}
      </button>
    </div>
  )
}

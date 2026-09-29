import type { BodyMeasurements, ManualHipPoints, ManualWaistPoints, PoseAnalysisResult } from '@/types'

type Pt = { x: number; y: number }

function mid(a: Pt | undefined, b: Pt | undefined): Pt | null {
  if (!a || !b) return null
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

const EMPTY: BodyMeasurements = {
  shoulderWidthPx: null,
  hipWidthPx: null,
  hipWidthApprox: false,
  waistWidthPx: null,
  torsoLengthPx: null,
  legLengthPx: null,
  shoulderHipRatio: null,
  waistHipRatio: null,
  waistShoulderRatio: null,
  upperLowerRatio: null,
  curvatureScore: null
}

/**
 * 정면 사진의 실제 landmark(+ 사용자가 직접 표시했을 때만 허리/골반 지점)로 신체 비율을 계산한다.
 * 모든 좌표는 이미지 정규화 좌표(0~1)이므로, 결과 값도 "픽셀 폭" 자체보다는 비율(Ratio)로
 * 쓰기 위한 상대값이다. 실제 cm 치수를 추정하지 않는다(요청 스펙 Rule 2 — 사진만으로 실제
 * 신체 치수를 확정하지 않는다).
 *
 * 골반 폭: 사용자가 직접 표시한 골반 지점(hipPoints)이 있으면 그 값을 쓰고, 없으면 MediaPipe
 * hip landmark(고관절 위치) 사이 거리를 근사치로 쓴다 — 이 근사치는 실제 골반 폭보다 좁게
 * 나오는 경향이 있어(고관절은 골반뼈 중 가장 넓은 지점이 아님) hipWidthApprox로 표시해둔다.
 */
export function computeBodyMeasurements(
  front: PoseAnalysisResult | null,
  waistPoints: ManualWaistPoints,
  hipPoints: ManualHipPoints = {}
): BodyMeasurements {
  const named = front?.named
  if (!named) return EMPTY

  const lSh = named.leftShoulder
  const rSh = named.rightShoulder
  const lHip = named.leftHip
  const rHip = named.rightHip
  const lAnkle = named.leftAnkle
  const rAnkle = named.rightAnkle

  const shoulderWidthPx = lSh && rSh ? dist(lSh, rSh) : null

  const manualHipWidthPx = hipPoints.left && hipPoints.right ? dist(hipPoints.left, hipPoints.right) : null
  const landmarkHipWidthPx = lHip && rHip ? dist(lHip, rHip) : null
  const hipWidthPx = manualHipWidthPx ?? landmarkHipWidthPx
  const hipWidthApprox = manualHipWidthPx == null && landmarkHipWidthPx != null

  const waistWidthPx = waistPoints.left && waistPoints.right ? dist(waistPoints.left, waistPoints.right) : null

  const shMid = mid(lSh, rSh)
  const hipMid = mid(lHip, rHip)
  const ankleMid = mid(lAnkle, rAnkle)

  const torsoLengthPx = shMid && hipMid ? dist(shMid, hipMid) : null
  const legLengthPx = hipMid && ankleMid ? dist(hipMid, ankleMid) : null

  const shoulderHipRatio = shoulderWidthPx && hipWidthPx ? Math.round((shoulderWidthPx / hipWidthPx) * 100) / 100 : null
  const waistHipRatio = waistWidthPx && hipWidthPx ? Math.round((waistWidthPx / hipWidthPx) * 100) / 100 : null
  const waistShoulderRatio =
    waistWidthPx && shoulderWidthPx ? Math.round((waistWidthPx / shoulderWidthPx) * 100) / 100 : null
  const upperLowerRatio =
    torsoLengthPx && legLengthPx ? Math.round((torsoLengthPx / legLengthPx) * 100) / 100 : null

  // 허리 굴곡 점수: 허리가 어깨·골반 중 더 좁은 쪽보다 얼마나 더 좁은지를 0~100으로 정규화.
  // 허리 지점을 표시하지 않았으면 계산하지 않는다(값을 지어내지 않음).
  let curvatureScore: number | null = null
  if (waistWidthPx && shoulderWidthPx && hipWidthPx) {
    const narrowerRef = Math.min(shoulderWidthPx, hipWidthPx)
    const diffRatio = Math.max(0, (narrowerRef - waistWidthPx) / narrowerRef)
    curvatureScore = Math.round(Math.min(1, diffRatio * 2.5) * 100) // 대략적인 정규화 계수
  }

  return {
    shoulderWidthPx,
    hipWidthPx,
    hipWidthApprox,
    waistWidthPx,
    torsoLengthPx,
    legLengthPx,
    shoulderHipRatio,
    waistHipRatio,
    waistShoulderRatio,
    upperLowerRatio,
    curvatureScore
  }
}

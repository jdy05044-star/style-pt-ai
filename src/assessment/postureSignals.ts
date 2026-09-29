import type { Landmark, PoseAnalysisResult } from '@/types'

const RAD2DEG = 180 / Math.PI

function tiltFromHorizontal(a: Landmark, b: Landmark): number {
  return Math.atan2(b.y - a.y, b.x - a.x) * RAD2DEG
}

function leanFromVertical(top: Landmark, bottom: Landmark): number {
  const dx = top.x - bottom.x
  const dy = top.y - bottom.y
  return Math.atan2(Math.abs(dx), Math.abs(dy)) * RAD2DEG
}

function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export interface KneeAlignmentResult {
  direction: string | null
}

export interface PostureSignals {
  shoulderTiltDeg: number | null
  shoulderTiltDirection: string | null
  pelvisTiltDeg: number | null
  pelvisTiltDirection: string | null
  kneeAlignmentLeft: KneeAlignmentResult
  kneeAlignmentRight: KneeAlignmentResult
  neckLengthPx: number | null
  armLengthPx: number | null
  /** 측면 사진이 있을 때만 계산 (귀-어깨 라인의 수직선 대비 기울기) */
  forwardHeadDeg: number | null
  forwardHeadNote: string | null
  /** 어깨·골반 기울기가 모두 뚜렷하게 관찰될 때만 채워지는 참고 문구 */
  asymmetryNote: string | null
}

const EMPTY: PostureSignals = {
  shoulderTiltDeg: null,
  shoulderTiltDirection: null,
  pelvisTiltDeg: null,
  pelvisTiltDirection: null,
  kneeAlignmentLeft: { direction: null },
  kneeAlignmentRight: { direction: null },
  neckLengthPx: null,
  armLengthPx: null,
  forwardHeadDeg: null,
  forwardHeadNote: null,
  asymmetryNote: null
}

/**
 * posture-pt-ai의 각도 계산 로직(어깨/골반 기울기, 무릎 정렬)을 같은 원칙(실제 landmark로만
 * 계산, 값이 없으면 null, 진단이 아니라 관찰 문구로만 서술)으로 style-pt-ai에도 가져온 버전.
 * "체형은 ○○형"이라는 실루엣 분류(bodyShape.ts)와는 별개로, 정렬 관련 참고 지표만 다룬다 —
 * 통증·질환을 판단하지 않는다.
 */
export function computePostureSignals(
  front: PoseAnalysisResult | null,
  side: PoseAnalysisResult | null
): PostureSignals {
  const n = front?.named
  if (!n) return EMPTY

  let shoulderTiltDeg: number | null = null
  let shoulderTiltDirection: string | null = null
  if (n.leftShoulder && n.rightShoulder) {
    const deg = tiltFromHorizontal(n.leftShoulder, n.rightShoulder)
    shoulderTiltDeg = Math.round(Math.abs(deg) * 10) / 10
    shoulderTiltDirection =
      Math.abs(deg) < 1.5 ? '좌우 차이 거의 없음' : deg > 0 ? '오른쪽 어깨가 더 낮은 편' : '왼쪽 어깨가 더 낮은 편'
  }

  let pelvisTiltDeg: number | null = null
  let pelvisTiltDirection: string | null = null
  if (n.leftHip && n.rightHip) {
    const deg = tiltFromHorizontal(n.leftHip, n.rightHip)
    pelvisTiltDeg = Math.round(Math.abs(deg) * 10) / 10
    pelvisTiltDirection =
      Math.abs(deg) < 1.5 ? '좌우 차이 거의 없음' : deg > 0 ? '오른쪽 골반이 더 낮은 편' : '왼쪽 골반이 더 낮은 편'
  }

  function kneeAlignment(hip?: Landmark, knee?: Landmark, ankle?: Landmark): KneeAlignmentResult {
    if (!hip || !knee || !ankle) return { direction: null }
    const legLength = Math.hypot(ankle.x - hip.x, ankle.y - hip.y) || 1
    const cross = (ankle.x - hip.x) * (knee.y - hip.y) - (ankle.y - hip.y) * (knee.x - hip.x)
    const pct = Math.round((cross / legLength / legLength) * 1000) / 10
    if (Math.abs(pct) < 2) return { direction: '정렬 양호 범위' }
    return { direction: pct > 0 ? '바깥쪽으로 치우침 (O다리 경향 참고)' : '안쪽으로 치우침 (X다리 경향 참고)' }
  }

  const kneeAlignmentLeft = kneeAlignment(n.leftHip, n.leftKnee, n.leftAnkle)
  const kneeAlignmentRight = kneeAlignment(n.rightHip, n.rightKnee, n.rightAnkle)

  // 목 길이: MediaPipe에 목 landmark가 따로 없어, 귀-어깨 거리로 근사한다 (실제 목뼈 길이가 아님)
  let neckLengthPx: number | null = null
  const ear = n.leftEar ?? n.rightEar
  const shoulderForNeck = n.leftEar ? n.leftShoulder : n.rightShoulder
  if (ear && shoulderForNeck) neckLengthPx = dist(ear, shoulderForNeck)

  // 팔 길이: 어깨→팔꿈치→손목 경로 길이 합 (좌우 중 인식된 쪽)
  let armLengthPx: number | null = null
  if (n.leftShoulder && n.leftElbow && n.leftWrist) {
    armLengthPx = dist(n.leftShoulder, n.leftElbow) + dist(n.leftElbow, n.leftWrist)
  } else if (n.rightShoulder && n.rightElbow && n.rightWrist) {
    armLengthPx = dist(n.rightShoulder, n.rightElbow) + dist(n.rightElbow, n.rightWrist)
  }

  // 머리 전방 위치: 측면 사진이 있을 때만 (정면 사진으로는 판단하기 어려움)
  let forwardHeadDeg: number | null = null
  let forwardHeadNote: string | null = null
  const sn = side?.named
  if (sn) {
    const sEar = sn.leftEar ?? sn.rightEar
    const sShoulder = sn.leftShoulder ?? sn.rightShoulder
    if (sEar && sShoulder) {
      const deg = leanFromVertical(sEar, sShoulder)
      forwardHeadDeg = Math.round(deg * 10) / 10
      forwardHeadNote =
        deg < 5 ? '귀가 어깨 위 수직선에 가까운 편' : '귀가 어깨보다 앞으로 나와 있는 경향 (forward head 참고)'
    }
  }

  let asymmetryNote: string | null = null
  if (shoulderTiltDeg != null && pelvisTiltDeg != null) {
    if (shoulderTiltDeg >= 2 || pelvisTiltDeg >= 2) {
      asymmetryNote = '어깨·골반 높이에 좌우 차이가 일부 관찰됩니다. 옷의 좌우 대칭 디테일보다는 비대칭 디테일이 시선을 분산해줄 수 있어요.'
    } else {
      asymmetryNote = '어깨·골반 높이의 좌우 차이가 크지 않은 편으로 관찰됩니다.'
    }
  }

  return {
    shoulderTiltDeg,
    shoulderTiltDirection,
    pelvisTiltDeg,
    pelvisTiltDirection,
    kneeAlignmentLeft,
    kneeAlignmentRight,
    neckLengthPx,
    armLengthPx,
    forwardHeadDeg,
    forwardHeadNote,
    asymmetryNote
  }
}

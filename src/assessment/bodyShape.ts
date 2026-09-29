import type { BodyMeasurements, BodyProfile, PrimaryBodyShape, ProfileConfidence } from '@/types'

/**
 * SHR·WHR 등을 실제 값으로만 판단하는 규칙 기반 분류. 어떤 경계값을 쓰든 사람마다 경계선에
 * 걸치는 경우가 있을 수 있어, "이 체형이 맞다"고 단정하지 않고 항상 "~경향" 수준으로 표현한다.
 * 허리 지점을 표시하지 않은 경우, 허리 굴곡 없이 어깨·골반 비율만으로 제한적으로만 판단하고
 * 신뢰도를 낮게 표시한다 (요청 스펙 Rule 1·2 준수).
 */
export function computeBodyProfile(m: BodyMeasurements): BodyProfile {
  const basis: string[] = []

  if (m.shoulderHipRatio == null) {
    return {
      primaryShape: 'insufficient',
      confidence: 'low',
      basis: ['어깨·골반 landmark가 인식되지 않아 분류할 수 없습니다'],
      shoulderVsHip: null,
      waistDefinition: '측정 불확실',
      upperLowerBalance: null,
      measurements: m
    }
  }

  const shr = m.shoulderHipRatio
  basis.push(`어깨/골반 비율(SHR) ${shr}`)

  const shoulderVsHip: BodyProfile['shoulderVsHip'] =
    shr > 1.05 ? '어깨가 더 넓은 편' : shr < 0.95 ? '골반이 더 넓은 편' : '균형 잡힌 편'

  let waistDefinition: BodyProfile['waistDefinition'] = '측정 불확실'
  let hasCurve = false
  if (m.curvatureScore != null) {
    basis.push(`허리 굴곡 점수 ${m.curvatureScore}/100 (직접 표시한 허리 지점 기준)`)
    waistDefinition = m.curvatureScore >= 40 ? '뚜렷한 편' : '적은 편'
    hasCurve = m.curvatureScore >= 40
  }

  let upperLowerBalance: BodyProfile['upperLowerBalance'] = null
  if (m.upperLowerRatio != null) {
    basis.push(`상체/하체 길이 비율(ULR) ${m.upperLowerRatio}`)
    upperLowerBalance =
      m.upperLowerRatio > 1.05 ? '상체가 상대적으로 긴 편' : m.upperLowerRatio < 0.9 ? '하체가 상대적으로 긴 편' : '균형 잡힌 편'
  }

  const confidence: ProfileConfidence = m.curvatureScore != null ? 'high' : 'moderate'

  let primaryShape: PrimaryBodyShape
  if (m.curvatureScore != null) {
    if (shoulderVsHip === '균형 잡힌 편' && hasCurve) primaryShape = 'hourglass'
    else if (shoulderVsHip === '어깨가 더 넓은 편') primaryShape = 'invertedTriangle'
    else if (shoulderVsHip === '골반이 더 넓은 편') primaryShape = 'triangle'
    else primaryShape = 'rectangle'
  } else {
    // 허리 지점 없이는 굴곡 여부를 알 수 없어 모래시계형/직선형 구분은 하지 않고,
    // 어깨-골반 비율만으로 판단 가능한 범위까지만 분류한다.
    if (shoulderVsHip === '어깨가 더 넓은 편') primaryShape = 'invertedTriangle'
    else if (shoulderVsHip === '골반이 더 넓은 편') primaryShape = 'triangle'
    else primaryShape = 'insufficient'
  }

  return { primaryShape, confidence, basis, shoulderVsHip, waistDefinition, upperLowerBalance, measurements: m }
}

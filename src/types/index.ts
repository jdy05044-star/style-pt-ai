// 앱 전역에서 사용하는 핵심 타입 정의.
// 원칙(posture-pt-ai와 동일): 실제로 측정/인식된 값만 사용하고, 값이 없으면 임의로 채우지 않는다.
// 체형은 하나의 카테고리로 단정하지 않고, 실제 신뢰도(어떤 지점까지 표시했는지)를 함께 보여준다.

export type ViewType = 'front' | 'side'

export const VIEW_LABELS: Record<ViewType, string> = {
  front: '정면',
  side: '측면 (선택)'
}

export const CAPTURE_GUIDES: Record<ViewType, string[]> = {
  front: [
    '전신이 프레임 안에 들어오게 서주세요',
    '몸에 너무 붙거나 너무 큰 옷은 피해주세요 (실루엣이 가려질 수 있어요)',
    '팔은 몸에서 살짝 떨어뜨려 주세요',
    '카메라를 몸통 높이에 두고, 정면을 바라봐주세요'
  ],
  side: ['몸의 옆면이 카메라를 향하도록 서주세요', '정면과 같은 자세로 자연스럽게 서주세요']
}

export interface CaptureImage {
  view: ViewType
  dataUrl: string
  capturedAt: string
}

export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export type LandmarkName =
  | 'nose'
  | 'leftEar'
  | 'rightEar'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'
  | 'leftFootIndex'
  | 'rightFootIndex'

export interface PoseAnalysisResult {
  view: ViewType
  landmarks: Landmark[]
  named: Partial<Record<LandmarkName, Landmark>>
  overallConfidence: number | null
  analyzedAt: string
}

/** 사진 위에서 사용자가 직접 탭해 표시하는 지점 (0~1 정규화) */
export interface ManualPoint {
  x: number
  y: number
}

/**
 * 허리 너비는 MediaPipe Pose의 자동 관절 인식만으로는 얻을 수 없다(관절 중심점만 제공하고
 * 허리 지점은 제공하지 않음). 그래서 사용자가 사진 위에서 직접 탭해 좌우 허리 위치를 표시하면
 * 그 값으로만 허리 관련 지표를 계산하고, 표시하지 않으면 "측정 불확실"로 남긴다.
 */
export interface ManualWaistPoints {
  left?: ManualPoint
  right?: ManualPoint
}

/** 스타일 목표 (요청 스펙 19번 항목) */
export type StyleGoal =
  | 'LOOK_TALLER'
  | 'LOOK_SLIMMER'
  | 'LOOK_LONGER_LEGS'
  | 'DEFINE_WAIST'
  | 'BALANCE_SHOULDERS'
  | 'BALANCE_HIPS'
  | 'LOOK_ELEGANT'
  | 'LOOK_FEMININE'
  | 'LOOK_MINIMAL'
  | 'LOOK_CLASSIC'
  | 'LOOK_MODERN'
  | 'LOOK_CASUAL'
  | 'LOOK_OFFICE'
  | 'LOOK_LUXURY'

export const STYLE_GOAL_LABELS: Record<StyleGoal, string> = {
  LOOK_TALLER: '키가 커 보이게',
  LOOK_SLIMMER: '슬림해 보이게',
  LOOK_LONGER_LEGS: '다리가 길어 보이게',
  DEFINE_WAIST: '허리 라인 살리기',
  BALANCE_SHOULDERS: '어깨 밸런스 맞추기',
  BALANCE_HIPS: '골반 밸런스 맞추기',
  LOOK_ELEGANT: '우아한 느낌',
  LOOK_FEMININE: '여성스러운 느낌',
  LOOK_MINIMAL: '미니멀한 느낌',
  LOOK_CLASSIC: '클래식한 느낌',
  LOOK_MODERN: '모던한 느낌',
  LOOK_CASUAL: '캐주얼한 느낌',
  LOOK_OFFICE: '오피스룩',
  LOOK_LUXURY: '고급스러운 느낌'
}

export const STYLE_GOAL_OPTIONS: StyleGoal[] = Object.keys(STYLE_GOAL_LABELS) as StyleGoal[]

// ── 체형 측정/분류 ──────────────────────────────────────────

/** 실제 landmark(+ 선택적으로 사용자가 표시한 허리 지점)로 계산한 원시 측정값. 없으면 null. */
export interface BodyMeasurements {
  shoulderWidthPx: number | null
  hipWidthPx: number | null
  waistWidthPx: number | null
  torsoLengthPx: number | null
  legLengthPx: number | null
  /** SHR = shoulder / hip */
  shoulderHipRatio: number | null
  /** WHR = waist / hip (허리 지점을 표시했을 때만) */
  waistHipRatio: number | null
  /** WSR = waist / shoulder (허리 지점을 표시했을 때만) */
  waistShoulderRatio: number | null
  /** ULR = torso / leg (상하체 비율) */
  upperLowerRatio: number | null
  /** 허리 굴곡 정도를 0~100으로 정규화 (허리 지점을 표시했을 때만) */
  curvatureScore: number | null
}

export type PrimaryBodyShape = 'hourglass' | 'invertedTriangle' | 'triangle' | 'rectangle' | 'insufficient'

export const BODY_SHAPE_LABELS: Record<PrimaryBodyShape, string> = {
  hourglass: '모래시계형에 가까운 경향',
  invertedTriangle: '역삼각형에 가까운 경향 (어깨가 상대적으로 넓은 편)',
  triangle: '삼각형에 가까운 경향 (골반이 상대적으로 넓은 편)',
  rectangle: '직선적인(스트레이트) 경향',
  insufficient: '분류 불확실'
}

/** 신체 프로필 신뢰도 — 허리 지점을 직접 표시했는지에 따라 달라진다 (지어내지 않음) */
export type ProfileConfidence = 'high' | 'moderate' | 'low'

export interface BodyProfile {
  primaryShape: PrimaryBodyShape
  confidence: ProfileConfidence
  /** 실제로 근거가 된 측정값/문구 (참고용) */
  basis: string[]
  shoulderVsHip: '어깨가 더 넓은 편' | '골반이 더 넓은 편' | '균형 잡힌 편' | null
  waistDefinition: '뚜렷한 편' | '적은 편' | '측정 불확실'
  upperLowerBalance: '상체가 상대적으로 긴 편' | '하체가 상대적으로 긴 편' | '균형 잡힌 편' | null
  measurements: BodyMeasurements
}

// ── 스타일 추천 ──────────────────────────────────────────

export type ClothingCategory = 'neckline' | 'sleeve' | 'topLength' | 'bottom' | 'dress' | 'outerwear'

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  neckline: '상의 넥라인',
  sleeve: '상의 소매',
  topLength: '상의 기장',
  bottom: '하의',
  dress: '원피스 실루엣',
  outerwear: '아우터 기장'
}

export type MatchTier = 'strong' | 'good' | 'neutral' | 'less'

export const MATCH_TIER_LABELS: Record<MatchTier, string> = {
  strong: 'Strong Match',
  good: 'Good Match',
  neutral: 'Neutral',
  less: 'Less Recommended'
}

export interface ScoredClothingOption {
  id: string
  category: ClothingCategory
  name: string
  score: number // 0~100
  tier: MatchTier
  reason: string
  alternative?: string
}

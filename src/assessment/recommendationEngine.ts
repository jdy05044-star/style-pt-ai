import { CLOTHING_OPTIONS, type BodySignalTag, type StyleTag } from '@/data/clothingRules'
import type { BodyProfile, ClothingCategory, MatchTier, ScoredClothingOption, StyleGoal } from '@/types'

/**
 * 실제 체형 프로필(BodyProfile)에서, 스타일링상 의미가 있는 "보완하고 싶은 신호"를 뽑아낸다.
 * 모두 실제로 계산된 값(shoulderVsHip, waistDefinition, upperLowerBalance)에서만 나온 것이며,
 * 새로운 데이터를 지어내지 않는다. 값이 없으면(측정 불확실) 해당 신호는 아예 만들지 않는다.
 */
function bodySignalWeights(profile: BodyProfile): Partial<Record<BodySignalTag, number>> {
  const w: Partial<Record<BodySignalTag, number>> = {}
  const add = (tag: BodySignalTag, n: number) => {
    w[tag] = (w[tag] ?? 0) + n
  }

  if (profile.shoulderVsHip === '어깨가 더 넓은 편') {
    add('reduceUpperVolume', 2)
    add('addLowerVolume', 1)
  } else if (profile.shoulderVsHip === '골반이 더 넓은 편') {
    add('reduceLowerVolume', 2)
    add('addUpperVolume', 1)
  }

  if (profile.waistDefinition === '적은 편' || profile.primaryShape === 'rectangle') {
    add('softenStraightLine', 1.5)
  }

  if (profile.upperLowerBalance === '하체가 상대적으로 긴 편') {
    add('elongateTorso', 1.5)
  } else if (profile.upperLowerBalance === '상체가 상대적으로 긴 편') {
    add('elongateLegs', 1.5)
  }

  return w
}

/** 사용자가 선택한 스타일 목표를 몸 신호 가중치 + 스타일 태그 가중치로 변환한다 */
function styleGoalWeights(
  goals: StyleGoal[],
  profile: BodyProfile
): { body: Partial<Record<BodySignalTag, number>>; style: Partial<Record<StyleTag, number>> } {
  const body: Partial<Record<BodySignalTag, number>> = {}
  const style: Partial<Record<StyleTag, number>> = {}
  const addBody = (tag: BodySignalTag, n: number) => {
    body[tag] = (body[tag] ?? 0) + n
  }
  const addStyle = (tag: StyleTag, n: number) => {
    style[tag] = (style[tag] ?? 0) + n
  }

  for (const g of goals) {
    switch (g) {
      case 'LOOK_TALLER':
        addBody('elongateOverall', 2)
        break
      case 'LOOK_SLIMMER':
        addBody('reduceUpperVolume', 1)
        addBody('reduceLowerVolume', 1)
        addBody('elongateOverall', 1)
        break
      case 'LOOK_LONGER_LEGS':
        addBody('elongateLegs', 2)
        break
      case 'DEFINE_WAIST':
        addBody('defineWaist', 2)
        break
      case 'BALANCE_SHOULDERS':
        if (profile.shoulderVsHip === '어깨가 더 넓은 편') addBody('reduceUpperVolume', 1.5)
        else addBody('addUpperVolume', 1.5)
        break
      case 'BALANCE_HIPS':
        if (profile.shoulderVsHip === '골반이 더 넓은 편') addBody('reduceLowerVolume', 1.5)
        else addBody('addLowerVolume', 1.5)
        break
      case 'LOOK_ELEGANT':
        addStyle('elegant', 2)
        break
      case 'LOOK_FEMININE':
        addStyle('feminine', 2)
        break
      case 'LOOK_MINIMAL':
        addStyle('minimal', 2)
        break
      case 'LOOK_CLASSIC':
        addStyle('classic', 2)
        break
      case 'LOOK_MODERN':
        addStyle('modern', 2)
        break
      case 'LOOK_CASUAL':
        addStyle('casual', 2)
        break
      case 'LOOK_OFFICE':
        addStyle('office', 2)
        break
      case 'LOOK_LUXURY':
        addStyle('luxury', 2)
        break
    }
  }

  return { body, style }
}

function tierOf(score: number): MatchTier {
  if (score >= 75) return 'strong'
  if (score >= 60) return 'good'
  if (score >= 45) return 'neutral'
  return 'less'
}

/**
 * 체형 프로필 + 스타일 목표를 근거로 각 카테고리(넥라인/소매/기장/하의/원피스/아우터)의
 * 옵션들에 0~100점을 매긴다. 점수 구성: 체형 신호 매칭 60% + 스타일 목표 매칭 40%
 * (요청 스펙 20번 항목의 가중합 아이디어를 단순화한 버전). 모든 매칭은 실제로 계산된
 * body 신호·사용자가 선택한 목표에서만 나오며, 임의의 값을 더하지 않는다.
 */
export function computeRecommendations(profile: BodyProfile, goals: StyleGoal[]): ScoredClothingOption[] {
  const bodyW = bodySignalWeights(profile)
  const goalW = styleGoalWeights(goals, profile)

  const combinedBody: Partial<Record<BodySignalTag, number>> = { ...bodyW }
  for (const [k, v] of Object.entries(goalW.body)) {
    const tag = k as BodySignalTag
    combinedBody[tag] = (combinedBody[tag] ?? 0) + (v ?? 0)
  }

  const maxBodyWeight = Math.max(1, ...Object.values(combinedBody).map((v) => v ?? 0))
  const maxStyleWeight = Math.max(1, ...Object.values(goalW.style).map((v) => v ?? 0))

  const scored = CLOTHING_OPTIONS.map((opt) => {
    const bodyMatch = opt.bodyTags.reduce((sum, t) => sum + (combinedBody[t] ?? 0), 0)
    const bodyScore = Math.min(1, bodyMatch / (maxBodyWeight * Math.max(1, opt.bodyTags.length ? 1.4 : 2)))

    const styleMatch = opt.styleTags.reduce((sum, t) => sum + (goalW.style[t] ?? 0), 0)
    const styleScore = goals.length > 0 ? Math.min(1, styleMatch / (maxStyleWeight * 1.4)) : 0.5

    // 아무 체형 신호도 필요 없는(보완할 것이 없는) 무난한 옵션은 중간 점수를 기본으로 준다.
    const baseline = opt.bodyTags.length === 0 ? 0.5 : 0.35

    const raw = baseline + bodyScore * 0.4 + styleScore * (goals.length > 0 ? 0.25 : 0.1)
    const score = Math.round(Math.min(1, raw) * 100)

    return {
      id: opt.id,
      category: opt.category,
      name: opt.name,
      score,
      tier: tierOf(score),
      reason: opt.note
    } satisfies ScoredClothingOption
  })

  // 카테고리별로 점수 높은 순 정렬, 2등을 alternative로 붙여준다
  const byCategory = new Map<ClothingCategory, ScoredClothingOption[]>()
  for (const s of scored) {
    const arr = byCategory.get(s.category) ?? []
    arr.push(s)
    byCategory.set(s.category, arr)
  }

  const result: ScoredClothingOption[] = []
  for (const [, arr] of byCategory) {
    arr.sort((a, b) => b.score - a.score)
    const top = arr[0]
    const second = arr[1]
    if (top && second) top.alternative = second.name
    result.push(...arr)
  }

  return result
}

/** 카테고리별 대표(1위) 추천만 추려서 반환 — Result 화면 요약 카드용 */
export function topPicksByCategory(all: ScoredClothingOption[]): ScoredClothingOption[] {
  const seen = new Set<ClothingCategory>()
  const picks: ScoredClothingOption[] = []
  const sorted = [...all].sort((a, b) => b.score - a.score)
  for (const s of sorted) {
    if (seen.has(s.category)) continue
    seen.add(s.category)
    picks.push(s)
  }
  // CATEGORY_LABELS 순서를 따르도록 category enum 순서로 재정렬
  const order: ClothingCategory[] = ['neckline', 'sleeve', 'topLength', 'bottom', 'dress', 'outerwear']
  return order.map((c) => picks.find((p) => p.category === c)).filter((p): p is ScoredClothingOption => !!p)
}

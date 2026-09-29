import type { ClothingCategory } from '@/types'

/**
 * 이 파일의 모든 항목명·태그·설명 문구는 자체 작성한 것이며, 특정 저작물(스타일북, 커머스 앱 등)의
 * 구체적인 표현이나 구조를 인용/재구성하지 않았다. "어깨가 넓으면 A, 좁으면 B" 같은 원칙은 스타일링
 * 분야에서 일반적으로 통용되는 수준의 지식이다.
 *
 * Rule 3(요청 스펙): 추천은 "금지"가 아니라 "적합도"로 표현한다 — 그래서 옵션 자체에 "나쁜 옵션"은
 * 없고, 체형·스타일 목표와 얼마나 맞는지(점수)만 다르다.
 */

export type BodySignalTag =
  | 'reduceUpperVolume'
  | 'addUpperVolume'
  | 'reduceLowerVolume'
  | 'addLowerVolume'
  | 'defineWaist'
  | 'softenStraightLine'
  | 'elongateLegs'
  | 'elongateTorso'
  | 'elongateOverall'

export type StyleTag =
  | 'elegant'
  | 'feminine'
  | 'minimal'
  | 'classic'
  | 'modern'
  | 'casual'
  | 'office'
  | 'luxury'

export interface ClothingOption {
  id: string
  category: ClothingCategory
  name: string
  bodyTags: BodySignalTag[]
  styleTags: StyleTag[]
  note: string
}

export const CLOTHING_OPTIONS: ClothingOption[] = [
  // ── 넥라인 ──
  { id: 'neck-v', category: 'neckline', name: 'V넥', bodyTags: ['reduceUpperVolume', 'elongateOverall'], styleTags: ['elegant', 'modern', 'minimal', 'office'], note: '세로로 시선을 이끌어 상체 폭이 상대적으로 덜 강조되고, 목선이 길어 보이는 효과가 있다고 알려져 있습니다.' },
  { id: 'neck-round', category: 'neckline', name: '라운드넥', bodyTags: [], styleTags: ['casual', 'classic', 'minimal'], note: '무난하게 어울리는 기본형 넥라인으로, 다른 아이템과의 조합 폭이 넓습니다.' },
  { id: 'neck-boat', category: 'neckline', name: '보트넥', bodyTags: ['addUpperVolume'], styleTags: ['classic', 'feminine'], note: '쇄골선을 가로로 드러내 어깨 라인에 시선을 더하는 효과가 있습니다.' },
  { id: 'neck-square', category: 'neckline', name: '스퀘어넥', bodyTags: ['addUpperVolume'], styleTags: ['elegant', 'feminine', 'modern'], note: '직선 절개가 쇄골·어깨선을 정돈되어 보이게 하는 편입니다.' },
  { id: 'neck-off-shoulder', category: 'neckline', name: '오프숄더', bodyTags: ['addUpperVolume'], styleTags: ['feminine', 'luxury'], note: '어깨 라인을 드러내 상체에 시선을 더하는 효과가 있습니다.' },
  { id: 'neck-turtleneck', category: 'neckline', name: '터틀넥', bodyTags: ['elongateOverall'], styleTags: ['classic', 'minimal', 'modern'], note: '목선을 감싸 세로 라인을 만들어주는 편입니다.' },

  // ── 소매 ──
  { id: 'sleeve-setin', category: 'sleeve', name: '셋인 소매 (기본 소매)', bodyTags: ['reduceUpperVolume'], styleTags: ['minimal', 'office', 'classic'], note: '어깨선을 몸에 자연스럽게 맞춰 상체 볼륨을 과도하게 키우지 않는 기본형입니다.' },
  { id: 'sleeve-raglan', category: 'sleeve', name: '래글런 소매', bodyTags: ['reduceUpperVolume'], styleTags: ['casual', 'modern'], note: '어깨 절개선이 사선으로 이어져 어깨가 상대적으로 완만해 보이는 편입니다.' },
  { id: 'sleeve-puff', category: 'sleeve', name: '퍼프 소매', bodyTags: ['addUpperVolume'], styleTags: ['feminine', 'classic'], note: '소매에 볼륨을 더해 상체 쪽으로 시선과 부피감을 추가하는 디자인입니다.' },
  { id: 'sleeve-balloon', category: 'sleeve', name: '벌룬 소매', bodyTags: ['addUpperVolume'], styleTags: ['modern', 'luxury'], note: '퍼프 소매와 비슷하게 상체 쪽 볼륨을 더하는 효과가 있습니다.' },
  { id: 'sleeve-fitted', category: 'sleeve', name: '핏된 긴소매', bodyTags: ['elongateOverall'], styleTags: ['minimal', 'office', 'modern'], note: '팔 라인을 따라 떨어져 전체적으로 정돈된 세로 라인을 만들어주는 편입니다.' },

  // ── 상의 기장 ──
  { id: 'top-cropped', category: 'topLength', name: '크롭 기장', bodyTags: ['elongateLegs'], styleTags: ['casual', 'modern', 'feminine'], note: '하이웨이스트 하의와 함께 다리 시작점을 시각적으로 높여, 다리가 길어 보이는 효과를 주는 편입니다.' },
  { id: 'top-waist', category: 'topLength', name: '허리 기장', bodyTags: ['defineWaist', 'elongateLegs'], styleTags: ['classic', 'office'], note: '허리 위치에서 딱 떨어져 허리 라인을 드러내면서 다리도 길어 보이게 하는 편입니다.' },
  { id: 'top-hip', category: 'topLength', name: '힙 기장', bodyTags: ['softenStraightLine'], styleTags: ['casual', 'minimal'], note: '골반을 자연스럽게 덮어주는 무난한 기장입니다.' },
  { id: 'top-long', category: 'topLength', name: '롱 기장', bodyTags: ['elongateTorso'], styleTags: ['modern', 'minimal'], note: '세로로 긴 라인을 만들어 상체가 상대적으로 길어 보이는 효과가 있습니다.' },

  // ── 하의 ──
  { id: 'bottom-skinny', category: 'bottom', name: '스키니 팬츠', bodyTags: ['elongateLegs'], styleTags: ['modern', 'minimal'], note: '다리 라인을 그대로 드러내 세로 라인을 강조하는 편입니다.' },
  { id: 'bottom-straight', category: 'bottom', name: '스트레이트 팬츠', bodyTags: ['reduceLowerVolume', 'softenStraightLine'], styleTags: ['classic', 'office'], note: '허벅지~밑단까지 일정한 폭으로 떨어져 하체 라인을 과장하지 않고 정돈해주는 편입니다.' },
  { id: 'bottom-wide', category: 'bottom', name: '와이드 팬츠', bodyTags: ['addLowerVolume', 'elongateLegs'], styleTags: ['modern', 'casual', 'luxury'], note: '허리부터 넓게 떨어져 세로 라인을 만들면서 하체에 볼륨을 더하는 효과가 있습니다.' },
  { id: 'bottom-aline-skirt', category: 'bottom', name: 'A라인 스커트', bodyTags: ['addLowerVolume', 'softenStraightLine'], styleTags: ['feminine', 'classic'], note: '허리에서 밑단으로 갈수록 자연스럽게 퍼져, 골반이 좁은 편이거나 직선적인 실루엣에 곡선감을 더해주는 편입니다.' },
  { id: 'bottom-pencil-skirt', category: 'bottom', name: '펜슬 스커트', bodyTags: ['elongateLegs', 'defineWaist'], styleTags: ['office', 'classic', 'elegant'], note: '몸에 맞게 떨어져 허리~다리 라인을 세로로 정돈해주는 편입니다.' },

  // ── 원피스 실루엣 ──
  { id: 'dress-wrap', category: 'dress', name: '랩 원피스', bodyTags: ['defineWaist'], styleTags: ['feminine', 'elegant'], note: '허리를 감싸 묶는 디자인이라 허리 라인을 자연스럽게 드러내는 편입니다.' },
  { id: 'dress-fit-flare', category: 'dress', name: '핏앤플레어 원피스', bodyTags: ['defineWaist', 'addLowerVolume'], styleTags: ['feminine', 'classic'], note: '허리에서 좁아졌다가 아래로 갈수록 퍼져, 허리 라인을 살리면서 하체에 자연스러운 볼륨을 더합니다.' },
  { id: 'dress-aline', category: 'dress', name: 'A라인 원피스', bodyTags: ['addLowerVolume', 'softenStraightLine'], styleTags: ['classic', 'casual'], note: '어깨~가슴선은 몸에 맞고 아래로 갈수록 퍼지는 실루엣으로, 상체가 상대적으로 넓은 경우에도 무난하게 어울리는 편입니다.' },
  { id: 'dress-sheath', category: 'dress', name: '시스 원피스 (일자형)', bodyTags: ['elongateOverall'], styleTags: ['office', 'minimal', 'modern'], note: '몸을 따라 일직선으로 떨어져 세로 라인을 살려주는 편입니다.' },
  { id: 'dress-empire', category: 'dress', name: '엠파이어 원피스', bodyTags: ['elongateLegs'], styleTags: ['feminine', 'casual'], note: '가슴 바로 아래에서 절개되어 다리 시작점을 시각적으로 높여주는 편입니다.' },

  // ── 아우터 기장 ──
  { id: 'outer-short', category: 'outerwear', name: '숏 기장 (재킷/볼레로)', bodyTags: ['elongateLegs'], styleTags: ['modern', 'casual'], note: '허리 위에서 끊겨 하체 비중을 시각적으로 늘려주는 편입니다.' },
  { id: 'outer-hip', category: 'outerwear', name: '힙 기장 (자켓/카디건)', bodyTags: ['softenStraightLine'], styleTags: ['office', 'classic'], note: '무난하게 활용하기 좋은 기본 기장입니다.' },
  { id: 'outer-long', category: 'outerwear', name: '롱 기장 (코트)', bodyTags: ['elongateOverall'], styleTags: ['minimal', 'elegant', 'luxury'], note: '세로로 긴 실루엣을 만들어 전체적으로 길어 보이는 효과가 있다고 알려져 있습니다.' }
]

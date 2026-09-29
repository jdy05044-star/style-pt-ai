import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CaptureImage, ManualWaistPoints, PoseAnalysisResult, StyleGoal, ViewType } from '@/types'

interface AppStateValue {
  captures: Partial<Record<ViewType, CaptureImage>>
  setCapture: (view: ViewType, image: CaptureImage | null) => void
  results: Partial<Record<ViewType, PoseAnalysisResult>>
  setResult: (view: ViewType, result: PoseAnalysisResult) => void
  waistPoints: ManualWaistPoints
  setWaistPoints: (next: ManualWaistPoints) => void
  styleGoals: StyleGoal[]
  setStyleGoals: (goals: StyleGoal[]) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [captures, setCaptures] = useState<Partial<Record<ViewType, CaptureImage>>>({})
  const [results, setResults] = useState<Partial<Record<ViewType, PoseAnalysisResult>>>({})
  const [waistPoints, setWaistPoints] = useState<ManualWaistPoints>({})
  const [styleGoals, setStyleGoals] = useState<StyleGoal[]>([])

  const setCapture = (view: ViewType, image: CaptureImage | null) => {
    setCaptures((prev) => {
      const next = { ...prev }
      if (image) next[view] = image
      else delete next[view]
      return next
    })
    setResults((prev) => {
      const next = { ...prev }
      delete next[view]
      return next
    })
    if (view === 'front') setWaistPoints({})
  }

  const setResult = (view: ViewType, result: PoseAnalysisResult) => {
    setResults((prev) => ({ ...prev, [view]: result }))
  }

  const value = useMemo(
    () => ({ captures, setCapture, results, setResult, waistPoints, setWaistPoints, styleGoals, setStyleGoals }),
    [captures, results, waistPoints, styleGoals]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState는 AppStateProvider 내부에서만 사용할 수 있습니다')
  return ctx
}

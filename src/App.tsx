import { Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import { AppStateProvider } from '@/state/AppState'
import Capture from '@/pages/Capture'
import Goals from '@/pages/Goals'
import Home from '@/pages/Home'
import Result from '@/pages/Result'

export default function App() {
  return (
    <AppStateProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </AppStateProvider>
  )
}

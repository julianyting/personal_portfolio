import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import RoulettePage from './pages/RoulettePage'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

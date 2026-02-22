import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { MarketProvider } from './context/MarketContext'
import { UserProvider } from './context/userContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TradePage from './pages/TradePage'

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <MarketProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/dashboard" element={<TradePage />} />
            </Routes>
          </div>
        </MarketProvider>
      </SocketProvider>
    </UserProvider>
  )
}

export default App
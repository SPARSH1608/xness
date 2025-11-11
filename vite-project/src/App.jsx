import { SocketProvider } from './context/SocketContext'
import { MarketProvider } from './context/MarketContext'
import TradePage from './pages/TradePage'
import { UserProvider } from './context/userContext'

function App() {
  return (
    <SocketProvider>
      <UserProvider>
        <MarketProvider>
          <div className="App">
            <TradePage />
          </div>
        </MarketProvider>
      </UserProvider>
    </SocketProvider>
  )
}

export default App
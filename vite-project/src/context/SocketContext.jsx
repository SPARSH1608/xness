import {createContext, useContext, useEffect, useState} from "react" 
import {io } from "socket.io-client"
const SocketContext = createContext()

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)
    const [currentAsset, setCurrentAsset] = useState('BTCUSDT')
    const [liquidated, setLiquidated] = useState(null) // <-- add this

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
        const s = io(socketUrl, {transports:['websocket']})
        setSocket(s)
        s.on('connect', () => {
            setConnected(true)
            // Emit joinRoom ONLY after connection is established and socket is ready
            // We might need to handle this via the joinAssetRoom function or rethink the logic slightly
            // But for now, let's keep it simple as before, but note that `currentAsset` dependency might be needed
            console.log('Socket connected:', s.id)
            if (currentAsset) {
                 s.emit('joinRoom', currentAsset)
            }
        })
        s.on('disconnect', () => {
            setConnected(false)
            console.log('Socket disconnected')
        })
        // Listen for liquidation event
        s.on('position_liquidated', (data) => {
            setLiquidated(data)
            // Optionally: show toast/alert here
            console.log('Position liquidated:', data)
        })
        return () => {
            s.disconnect()
        }
    }, [])

    const joinAssetRoom = (asset) => {
        if(!socket) return
        socket.emit('leaveRoom', currentAsset)
        socket.emit('joinRoom', asset)
        setCurrentAsset(asset)
        console.log('Switched to asset:', asset)
    }

    return (
        <SocketContext.Provider value={{ socket, connected, currentAsset, joinAssetRoom, liquidated }}>
            {children}
        </SocketContext.Provider>
    )
}
export const useSocket = () => useContext(SocketContext)
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
            // Join all known asset rooms so prices update everywhere
            console.log('Socket connected:', s.id)
            s.emit('joinRoom', 'btcusdt')
            s.emit('joinRoom', 'ethusdt')
            s.emit('joinRoom', 'solusdt')
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
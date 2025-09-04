import {createContext, useContext, useEffect, useState} from "react" 
import {io } from "socket.io-client"
const SocketContext = createContext()

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)
    const [currentAsset, setCurrentAsset] = useState('BTCUSDT')
    const [liquidated, setLiquidated] = useState(null) // <-- add this

    useEffect(() => {
        const s = io('http://localhost:3000', {transports:['websocket']})
        setSocket(s)
        s.on('connect', () => {
            setConnected(true)
            s.emit('joinRoom', currentAsset)
            console.log('Socket connected:', s.id)
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
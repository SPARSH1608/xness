require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors') // <-- add this
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const startRedisSubscriber = require('./pubsub/redis-subscriber')
const { startBinanceStreams } = require('./binance-publisher')
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)
    socket.on("joinRoom", (asset) => {
        socket.join(asset)
        console.log(`User ${socket.id} joined room: ${asset}`)
    })
    socket.on("leaveRoom", (asset) => {
        socket.leave(asset)
        console.log(`User ${socket.id} left room: ${asset}`)
    })
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})
app.use(cors()) // <-- add this line before your routes
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).send('Xness API is running!')
})

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/candles', require('./routes/candles'))
app.use('/api/positions', require('./routes/positions'))
async function startServer() {
    setTimeout(() => {
        startRedisSubscriber(io)
        startBinanceStreams()
    }, 5000)

    server.listen(3000, () => {
        console.log('Server is running on port 3000')
    })
}

startServer().catch(err => {
    console.error('Error starting server:', err)
})
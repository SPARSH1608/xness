const {createClient}=require('redis')

async function startRedisSubscriber(io){
    const redisSub=createClient({url:'redis://localhost:6379'})
    
    redisSub.on('error',(err)=>{
        console.log('redis subscriber error',err)
    })
    await redisSub.connect()
    await redisSub.subscribe('trades',(message)=>{
        try{            
          const trade = JSON.parse(message)

            io.to(trade.asset).emit('trade', trade)
            // console.log('Emitted trade event:', message)
        }catch(err){
            console.error('Error emitting trade event:', err)
        }
    })
    console.log('Redis subscriber connected and listening to trades channel')
}
module.exports=startRedisSubscriber
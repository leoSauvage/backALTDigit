import app from '@adonisjs/core/services/app'
import ws from '#models/ws'
app.ready(() => {
  ws.boot()
  const io = ws.io
  io?.on('connection', (socket: any) => {
    socket.on('joinContractRoom', (contractId: string) => {
      socket.join(`contract_${contractId}`)
      console.log('contractJoin')
    })
    socket.on('joinUserRoom', (userId: string) => {
      socket.join(`user_${userId}`)
      console.log("user join")
    })
  })
})

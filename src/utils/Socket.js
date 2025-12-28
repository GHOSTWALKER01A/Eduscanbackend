import { Server } from "socket.io";


 export const initSocket = (server) =>{
    const io = new Server(server, { cors:{
        origin: 'http://localhost:5000'
    }
})

io.on('connection', (socket) =>{
    console.log('Client connected:', socket.id)


socket.on('mac-update', async (data) => {
      // Trigger geoLocation internally
      // (Implement as internal call or emit to attendance service)
      console.log('MAC update received:', data);
})

socket.on('disconnect', () => console.log('Client disconnected:', socket.id ))
})

return io
}
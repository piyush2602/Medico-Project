import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import http from 'http'
import { Server } from 'socket.io'
import chatModel from './models/chatModel.js'
import { startDailyReminderCron } from './jobs/reminderCron.js'

// app config
const app = express()
const port = process.env.PORT || 4000
const server = http.createServer(app)

// Start cron jobs
startDailyReminderCron()
connectDB()
connectCloudinary()

// middle wares
app.use(express.json())
app.use(cors())

// api end point
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
    res.send('API WORKING')
})

const io = new Server(server, {
    cors: {
        origin: '*', // allow frontend and admin apps
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        socket.join(data.appointmentId)
    })

    socket.on('send_message', async (data) => {
        try {
            const newMessage = new chatModel({
                appointmentId: data.appointmentId,
                sender: data.sender,
                text: data.text || '',
                attachment: data.attachment || { url: '', type: '' },
                timestamp: Date.now()
            })
            await newMessage.save()
            // Let's emit to others, sender can optimistically render.
            socket.to(data.appointmentId).emit('receive_message', newMessage)
        } catch (error) {
            console.error('Error saving message:', error)
        }
    })

    socket.on('disconnect', () => {
        // user disconnected
    })
})

server.listen(port,()=>console.log("Server Started",port))

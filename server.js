import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './db/conntectToDB.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js';
import userRoutes from './routes/user.route.js'
import { app, server } from './socket/socket.js';

dotenv.config()


const port = process.env.PORT;

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:5173","https://chat-commune.netlify.app"],
    methods: ["GET", "POST"], 
    credentials: true,              
  }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes)
app.use('/message', messageRoutes)
app.use('/user', userRoutes)



server.listen(port, () => {
    connectToDB()
    console.log(`server is running fine on http://localhost:${port}`)
})
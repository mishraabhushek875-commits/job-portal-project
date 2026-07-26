import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import {Server}from 'socket.io';
import {createServer} from 'http';
import applicationRoutes from './src/routes/applicationRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import jobRoutes from './src/routes/jobRoutes.js'
import {initSocket} from './src/socket/socketHandler.js'
import aiRoutes from './src/routes/aiRoutes.js';
import dsaRoutes from './src/routes/dsaRoutes.js';
import hackathonRoutes from './src/routes/hackathonRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import startHackathonCron from './src/cron/hackathonCron.js';


//databse and env connect
connectDB(); 

const app = express();

// ─── HTTP Server banao ───
const httpServer=createServer(app);

// ─── Socket.io attach karo ───
const io = new Server(httpServer, {      
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


// ─── Socket initialize karo ───
initSocket(io);


//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/api/auth',authRoutes);
app.use('/api/applications',applicationRoutes);
app.use('/api/jobs',jobRoutes);
app.use('/api/ai', aiRoutes);

//dsa routes 
app.use('/api/dsa', dsaRoutes);
//hackathon
app.use('/api/hackathons', hackathonRoutes);
//notifications
app.use('/api/notifications', notificationRoutes);
//chat
app.use('/api/chat', chatRoutes);



app.get('/',(req,res)=>{
  res.json({message:"server chal rha hai"});
});

// Start Cron Jobs
startHackathonCron();


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});


const PORT=process.env.PORT||5001;
httpServer.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`)
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
});

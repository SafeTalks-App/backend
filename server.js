const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ CORS config untuk localhost frontend (Vite)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// ✅ Default route supaya tidak muncul error "Cannot GET /"
app.get('/', (req, res) => {
  res.send('✅ SafeTalks Backend is running!');
});

// ✅ Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('⚡️ User connected:', socket.id);

  socket.on('send_message', (data) => {
    console.log('📨 Broadcasting message:', data);
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('⚡️ User disconnected:', socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5050;
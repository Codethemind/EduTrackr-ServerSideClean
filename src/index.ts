import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { connectDB } from './infrastructure/config/db';
import AuthRoutes from './interface/routes/AuthRoute';
import StudentRoutes from './interface/routes/StudentRoutes';
import AdminRoutes from './interface/routes/AdminRoutes';
import TeacherRoutes from './interface/routes/TeacherRoutes';
import DepartmentRoutes from './interface/routes/departmentRoutes';
import CourseRoutes from './interface/routes/courseRoutes';
import ScheduleRoutes from './interface/routes/ScheduleRoutes';
import AssignmentRoute from './interface/routes/AssignmentRoute';
import AiRoutes from './interface/routes/AiRoute';
import { createChatRoutes } from './interface/routes/ChatRoutes';
import { initializeSocket } from './infrastructure/config/socket';
import { createNotificationRoutes } from './interface/routes/NotificationRoutes';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize Socket.IO
initializeSocket(io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy 🚀' });
});

// Serve profile pictures
app.use('/uploads', express.static(path.join(process.cwd(), 'src/infrastructure/fileStorage/profilePic')));

// Routes
app.use('/auth', AuthRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/admins', AdminRoutes);
app.use('/api/teachers', TeacherRoutes);
app.use('/api/departments', DepartmentRoutes);
app.use('/api/courses', CourseRoutes);
app.use('/api/schedules', ScheduleRoutes);
app.use('/api/assignments', AssignmentRoute);
app.use('/api/messages', createChatRoutes(io));
app.use('/api/ai', AiRoutes);
app.use('/api/notifications', createNotificationRoutes());

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Something went wrong!',
    status,
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});
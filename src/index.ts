import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { connectDB } from "./infrastructure/config/db";
import AuthRoutes from './interface/routes/AuthRoute'



import StudentRoutes from './interface/routes/StudentRoutes'
import AdminRoutes from "./interface/routes/AdminRoutes";
import TeacherRoutes from "./interface/routes/TeacherRoutes";
import DepartmentRoutes from './interface/routes/departmentRoutes'
import CoursetRoutes from './interface/routes/courseRoutes'


dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, 
  }));

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy 🚀' });
});


app.use('/uploads', express.static(path.join(process.cwd(), 'src/infrastructure/fileStorage/profilePic')));


app.use("/auth", AuthRoutes);
app.use('/api/students', StudentRoutes);
app.use("/api/admins", AdminRoutes);
app.use("/api/teachers", TeacherRoutes);
app.use("/api/departments", DepartmentRoutes);
app.use("/api/courses", CoursetRoutes);



// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('dsf',err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Something went wrong!',
        status
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`⚡ Server running on http://localhost:${PORT}`);
});

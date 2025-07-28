"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./infrastructure/config/db");
const AuthRoute_1 = __importDefault(require("./interface/routes/AuthRoute"));
const StudentRoutes_1 = __importDefault(require("./interface/routes/StudentRoutes"));
const AdminRoutes_1 = __importDefault(require("./interface/routes/AdminRoutes"));
const TeacherRoutes_1 = __importDefault(require("./interface/routes/TeacherRoutes"));
const departmentRoutes_1 = __importDefault(require("./interface/routes/departmentRoutes"));
const courseRoutes_1 = __importDefault(require("./interface/routes/courseRoutes"));
const ScheduleRoutes_1 = __importDefault(require("./interface/routes/ScheduleRoutes"));
const AssignmentRoute_1 = __importDefault(require("./interface/routes/AssignmentRoute"));
const AiRoute_1 = __importDefault(require("./interface/routes/AiRoute"));
const NotificationRoutes_1 = __importDefault(require("./interface/routes/NotificationRoutes"));
const ChatRoutes_1 = require("./interface/routes/ChatRoutes");
const socket_1 = require("./infrastructure/config/socket");
const ConcernRoutes_1 = __importDefault(require("./interface/routes/ConcernRoutes"));
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});
// Initialize Socket.IO
(0, socket_1.initializeSocket)(io);
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy 🚀' });
});
// Serve profile pictures
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'src/infrastructure/fileStorage/profilePic')));
// Routes
app.use('/auth', AuthRoute_1.default);
app.use('/api/students', StudentRoutes_1.default);
app.use('/api/admins', AdminRoutes_1.default);
app.use('/api/teachers', TeacherRoutes_1.default);
app.use('/api/departments', departmentRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/schedules', ScheduleRoutes_1.default);
app.use('/api/assignments', AssignmentRoute_1.default);
app.use('/api/messages', (0, ChatRoutes_1.createChatRoutes)(io));
app.use('/api/ai', AiRoute_1.default);
app.use('/api/notifications', NotificationRoutes_1.default);
app.use('/api/concerns', ConcernRoutes_1.default);
const APP_ID = process.env.YOUR_AGORA_APP_ID;
const APP_CERTIFICATE = process.env.YOUR_AGORA_APP_CERTIFICATE;
app.post('/api/agora/token', (req, res) => {
    const { channelName, userId } = req.body;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, userId, role, privilegeExpiredTs);
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});
// Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.log(err.message);
    res.status(status).json({
        error: err.message || 'Something went wrong!',
        status,
    });
});
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`⚡ Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map
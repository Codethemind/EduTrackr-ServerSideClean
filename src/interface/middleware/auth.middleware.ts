// import { Request, Response, NextFunction } from 'express';
// import { UserRole } from '../../domain/entities/Student';
// import jwt from 'jsonwebtoken';

// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 id: string;
//                 role: UserRole;
//             };
//         }
//     }
// }

// export const authMiddleware = (allowedRoles?: UserRole[]) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const authHeader = req.headers.authorization;
//             if (!authHeader) {
//                 return res.status(401).json({ message: 'No authorization header' });
//             }

//             const token = authHeader.split(' ')[1];
//             if (!token) {
//                 return res.status(401).json({ message: 'No token provided' });
//             }

//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
//                 id: string;
//                 role: UserRole;
//             };

//             if (allowedRoles && !allowedRoles.includes(decoded.role)) {
//                 return res.status(403).json({ message: 'Insufficient permissions' });
//             }

//             req.user = decoded;
//             next();
//         } catch (error) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
//     };
// }; 
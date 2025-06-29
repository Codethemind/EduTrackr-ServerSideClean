import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. Please contact administrator.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token structure.'
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import config from '../../infrastructure/services/TokenService'

// interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     role: string;
//   };
// }

// export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: 'Access denied. No token provided.'
//     });
//   }

//   if (!config.jwtSecret) {
//     console.error('JWT_SECRET is not configured');
//     return res.status(500).json({
//       success: false,
//       message: 'Server configuration error. Please contact administrator.'
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
//     if (!decoded || !decoded.id || !decoded.role) {
//       return res.status(403).json({
//         success: false,
//         message: 'Invalid token structure.'
//       });
//     }
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     return res.status(403).json({
//       success: false,
//       message: 'Invalid or expired token.'
//     });
//   }
// };

// export const authorizeRoles = (roles: string[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. Not authenticated.'
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: `Access denied. Required role: ${roles.join(', ')}. Your role: ${req.user.role}`
//       });
//     }

//     next();
//   };
// }; 
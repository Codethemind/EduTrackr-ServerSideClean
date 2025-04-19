import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: User, expiresIn: string, type: 'access' | 'refresh'): string => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            type
        },
        JWT_SECRET,
        { expiresIn }
    );
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}; 
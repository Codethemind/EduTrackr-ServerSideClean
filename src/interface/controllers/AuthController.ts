import { AuthUseCase } from "../../application/useCases/AuthUseCase";
import { Request, Response } from "express";

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async loginStudent(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { student, accessToken, refreshToken } = await this.authUseCase.loginStudent(email, password);

      // Set Refresh Token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Send Access Token and Student info
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          student,
          accessToken,
        },
      });

    } catch (error: any) {
      console.error("Login Error:", error);
      const statusCode = 
        error.message === "User does not exist" || 
        error.message === "Incorrect Password" 
          ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ----------------- ADMIN LOGIN -----------------
  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { admin, accessToken, refreshToken } = await this.authUseCase.loginAdmin(email, password);

      // Set Refresh Token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Send Access Token and Admin info
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          admin,
          accessToken,
        },
      });

    } catch (error: any) {
      console.error("Login Error:", error);
      const statusCode = 
        error.message === "Email doesn't exist" || 
        error.message === "Incorrect password" 
          ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

    // ----------------- TEACHER LOGIN -----------------
    async loginTeacher(req: Request, res: Response): Promise<void> {
      try {
        const { email, password } = req.body;
  
        const { teacher, accessToken, refreshToken } = await this.authUseCase.loginTeacher(email, password);
  
        // Set Refresh Token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
  
        // Send Access Token and Teacher info
        res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            teacher,
            accessToken,
          },
        });
  
      } catch (error: any) {
        console.error("Login Error:", error);
        const statusCode = 
          error.message === "Email doesn't exist" || 
          error.message === "Incorrect password" 
            ? 401 : 500;
  
        res.status(statusCode).json({
          success: false,
          message: error.message || "Internal Server Error",
        });
      }
    }
  


  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log(email)
      const response = await this.authUseCase.forgotPassword(email);
      return res.status(200).json({
        success: true,
        message: 'Reset instructions sent if account exists',
        response
      });
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error'
      });
    }
  }
  
  async resetPassword(req: Request, res: Response) {
    try {
      // 1) get token from URL params
      const token = req.params.token as string;

      // 2) get email & newPassword from JSON body
      const { email, newPassword } = req.body as {
        email?: string;
        newPassword?: string;
      };
      console.log('email',email,'password',newPassword)
      // 3) validate inputs
      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, token and new password are required",
        });
      }

      // 4) call your use‑case
      const result = await this.authUseCase.resetPassword(
        email,
        token,
        newPassword
      );

      // 5) send back success
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      console.error("Reset Password Error:", err);

      // 6) choose status code based on error type
      const isClientError =
        err.message.includes("Invalid") ||
        err.message.includes("expired") ||
        err.message.includes("required");
      const status = isClientError ? 400 : 500;

      return res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh Token is missing' });
        return;
      }
  
      const { accessToken } = await this.authUseCase.refreshAccessToken(refreshToken);
  
      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        data: {
          accessToken,
        },
      });
  
    } catch (error: any) {
      console.error("Refresh Token Error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Unauthorized",
      });
    }
  }
  
  
}

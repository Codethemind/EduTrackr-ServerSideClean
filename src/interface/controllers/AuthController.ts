import { AuthUseCase } from "../../application/useCases/AuthUseCase";
import { Request, Response } from "express";

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async loginStudent(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { student, accessToken, refreshToken } = await this.authUseCase.loginStudent(email, password);
console.log('access token',accessToken)
console.log('refresh token',refreshToken)


      res.cookie('refreshToken', refreshToken, {
       httpOnly: true,
        secure:true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      console.log('refresh token',req.cookies)

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

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { admin, accessToken, refreshToken } = await this.authUseCase.loginAdmin(email, password);

      res.cookie('refreshToken', refreshToken, {
       httpOnly: true,
        secure:true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


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
        error.message === "User does not exist" || 
        error.message === "Incorrect Password" 
          ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
    
  async loginTeacher(req: Request, res: Response): Promise<void> {
      try {
        const { email, password } = req.body;
        const { teacher, accessToken, refreshToken } = await this.authUseCase.loginTeacher(email, password);
  
      
        res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
        secure:true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });
  
      
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
      const msg = error.message?.toLowerCase().trim();
const statusCode = 
   msg === "user does not exist"|| 
  msg === "incorrect password"
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
     
      const token = req.params.token as string;

    
      const { email, newPassword } = req.body as {
        email?: string;
        newPassword?: string;
      };
  
      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, token and new password are required",
        });
      }

    
      const result = await this.authUseCase.resetPassword(
        email,
        token,
        newPassword
      );

      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      console.error("Reset Password Error:", err);

  
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
    console.log('Refresh token endpoint hit');
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log('Refresh token from cookies:', refreshToken);
      console.log('All cookies:', req.cookies);
      
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh Token is missing' });
        return;
      }
  
      const { accessToken } = await this.authUseCase.refreshAccessToken(refreshToken);
      console.log('New access token generated:', accessToken);
      
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

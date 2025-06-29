import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { HttpStatus } from "../../common/enums/http-status.enum";

export class AdminController {
  constructor(private adminUseCase: AdminUseCase) {}

  async createAdminWithImage(req: Request, res: Response): Promise<void> {
    try {
      const adminData = req.body;
      const profileImagePath = req.file?.path;
      const admin = await this.adminUseCase.createAdmin(adminData, profileImagePath);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Admin created successfully",
        data: admin,
      });
    } catch (err: any) {
      console.error("Create Admin With Image Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to create admin",
        error: err.message,
      });
    }
  }

  async updateAdminProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.params.id;
      const profileImagePath = req.file?.path;

      if (!profileImagePath) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "No image uploaded" });
        return;
      }

      const updatedAdmin = await this.adminUseCase.updateAdminProfileImage(adminId, profileImagePath);
      if (!updatedAdmin) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Admin not found" });
        return;
      }
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Profile image updated successfully",
        data: {
          profileImage: updatedAdmin.profileImage,
          admin: updatedAdmin,
        },
      });
    } catch (err: any) {
      console.error("Update Admin Profile Image Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update profile image",
        error: err.message,
      });
    }
  }

  async findAdminById(req: Request, res: Response): Promise<void> {
    try {
      const admin = await this.adminUseCase.findAdminById(req.params.id);
      if (!admin) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Admin not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: admin });
    } catch (err: any) {
      console.error("Find Admin By Id Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve admin",
        error: err.message,
      });
    }
  }

  async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.params.id;
      const adminData = req.body;
      const profileImagePath = req.file?.path;

      const updatedAdmin = await this.adminUseCase.updateAdmin(adminId, adminData, profileImagePath);
      if (!updatedAdmin) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Admin not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedAdmin });
    } catch (err: any) {
      console.error("Update Admin Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update admin",
        error: err.message,
      });
    }
  }

  async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.adminUseCase.deleteAdmin(req.params.id);
      if (!deleted) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Admin not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, message: "Admin deleted successfully" });
    } catch (err: any) {
      console.error("Delete Admin Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to delete admin",
        error: err.message,
      });
    }
  }

  async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await this.adminUseCase.getAllAdmins();
      res.status(HttpStatus.OK).json({ success: true, data: admins });
    } catch (err: any) {
      console.error("Get All Admins Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve admins",
        error: err.message,
      });
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { searchTerm = "", role } = req.query;

      if (typeof searchTerm !== "string") {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid search term",
        });
        return;
      }

      if (role && typeof role !== "string") {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid role parameter",
        });
        return;
      }

      const users = await this.adminUseCase.searchUsers(searchTerm, role as string);
      res.status(HttpStatus.OK).json({
        success: true,
        data: users,
        message: users.length ? "Users retrieved successfully" : "No users found",
      });
    } catch (err: any) {
      console.error("Search Users Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to search users",
        error: err.message,
      });
    }
  }
}
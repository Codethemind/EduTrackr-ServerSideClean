// src/infrastructure/repositories/AdminRepository.ts
import { IAdminRepository } from "../../application/Interfaces/IAdmin";
import Admin from "../../domain/entities/Admin";
import adminModel from "../models/AdminModel"; // You will create a Mongoose model

export class AdminRepository implements IAdminRepository {

    private toEntity(adminObj: any): Admin {
        return new Admin({
            id: adminObj._id?.toString(),
            username: adminObj.username,
            email: adminObj.email,
            firstname: adminObj.firstname,
            lastname: adminObj.lastname,
            password: adminObj.password,
            profileImage: adminObj.profileImage,
            role: adminObj.role || 'Admin',
        });
    }

    async createAdmin(admin: Admin): Promise<Admin> {
        const newAdmin = new adminModel(admin);
        const savedAdmin = await newAdmin.save();
        return this.toEntity(savedAdmin.toObject());
    }

    async findAdminById(id: string): Promise<Admin | null> {
        const admin = await adminModel.findById(id).lean();
        return admin ? this.toEntity(admin) : null;
    }
    async findAdminByEmail(email: string): Promise<Admin | null> {
        const admin = await adminModel.findOne({email:email})
        return admin ? this.toEntity(admin) : null;
    }

    async updateAdmin(id: string, admin: Partial<Admin>): Promise<Admin | null> {
        const updatedAdmin = await adminModel.findByIdAndUpdate(id, admin, { new: true }).lean();
        return updatedAdmin ? this.toEntity(updatedAdmin) : null;
    }

    async deleteAdmin(id: string): Promise<boolean> {
        const result = await adminModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAllAdmins(): Promise<Admin[]> {
        const admins = await adminModel.find().lean();
        return admins.map(admin => this.toEntity(admin));
    }
}

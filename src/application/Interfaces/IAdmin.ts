// src/application/Interfaces/IAdmin.ts
import Admin from "../../domain/entities/Admin";

export interface IAdminRepository {
    createAdmin(admin: Admin): Promise<Admin>;
    findAdminById(id: string): Promise<Admin | null>;
    updateAdmin(id: string, adminData: Partial<Admin>): Promise<Admin | null>;
    deleteAdmin(id: string): Promise<boolean>;
    getAllAdmins(): Promise<Admin[]>;
}

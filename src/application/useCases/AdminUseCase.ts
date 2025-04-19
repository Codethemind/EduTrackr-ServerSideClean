// src/application/useCases/AdminUseCase.ts
import { IAdminRepository } from "../Interfaces/IAdmin";
import Admin from "../../domain/entities/Admin";

export class AdminUseCase {
    constructor(private adminRepository: IAdminRepository) {}

    async createAdmin(admin: Admin): Promise<Admin> {
        return await this.adminRepository.createAdmin(admin);
    }

    async findAdminById(id: string): Promise<Admin | null> {
        return await this.adminRepository.findAdminById(id);
    }

    async updateAdmin(id: string, adminData: Partial<Admin>): Promise<Admin | null> {
        return await this.adminRepository.updateAdmin(id, adminData);
    }

    async deleteAdmin(id: string): Promise<boolean> {
        return await this.adminRepository.deleteAdmin(id);
    }

    async getAllAdmins(): Promise<Admin[]> {
        return await this.adminRepository.getAllAdmins();
    }
}

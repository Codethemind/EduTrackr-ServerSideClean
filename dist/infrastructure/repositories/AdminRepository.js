"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const Admin_1 = __importDefault(require("../../domain/entities/Admin"));
const AdminModel_1 = __importDefault(require("../models/AdminModel"));
class AdminRepository {
    toEntity(adminObj) {
        return new Admin_1.default({
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
    async createAdmin(admin) {
        const newAdmin = new AdminModel_1.default(admin);
        const savedAdmin = await newAdmin.save();
        return this.toEntity(savedAdmin.toObject());
    }
    async findAdminById(id) {
        const admin = await AdminModel_1.default.findById(id).lean();
        return admin ? this.toEntity(admin) : null;
    }
    async findAdminByEmail(email) {
        const admin = await AdminModel_1.default.findOne({ email }).lean();
        return admin ? this.toEntity(admin) : null;
    }
    async updateAdmin(id, adminData) {
        const updatedAdmin = await AdminModel_1.default.findByIdAndUpdate(id, adminData, { new: true }).lean();
        return updatedAdmin ? this.toEntity(updatedAdmin) : null;
    }
    async deleteAdmin(id) {
        const result = await AdminModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async getAllAdmins() {
        const admins = await AdminModel_1.default.find().lean();
        return admins.map(admin => this.toEntity(admin));
    }
    async searchUsers(searchTerm, role = 'Admin') {
        const query = {
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        };
        if (role !== 'All') {
            query.role = role;
        }
        const admins = await AdminModel_1.default.find(query).lean();
        return admins.map((admin) => this.toEntity(admin));
    }
}
exports.AdminRepository = AdminRepository;
//# sourceMappingURL=AdminRepository.js.map
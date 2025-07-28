"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUseCase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const imageUtils_1 = require("../../common/utils/imageUtils");
class AdminUseCase {
    constructor(adminRepository, emailService, teacherRepository, studentRepository) {
        this.adminRepository = adminRepository;
        this.emailService = emailService;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }
    async createAdmin(adminData, profileImagePath) {
        let emailError = null;
        try {
            if (!adminData.email || !adminData.username || !adminData.password) {
                throw new Error("Email, username, and password are required");
            }
            const adminInput = {
                ...adminData,
                role: adminData.role || "Admin",
                firstname: adminData.firstName || adminData.firstname || "",
                lastname: adminData.lastName || adminData.lastname || "",
                profileImage: profileImagePath
                    ? (0, imageUtils_1.ensureFullImageUrl)(profileImagePath)
                    : "https://res.cloudinary.com/djpom2k7h/image/upload/v1/admin_profiles/default-profile.png",
            };
            delete adminInput.firstName;
            delete adminInput.lastName;
            if (adminInput.password) {
                adminInput.password = await bcrypt_1.default.hash(adminInput.password, 10);
            }
            const admin = await this.adminRepository.createAdmin(adminInput);
            const subject = `Welcome to Our Platform, ${admin.firstname}!`;
            const html = `
        <h2>Welcome, ${admin.firstname} ${admin.lastname}!</h2>
        <p>Thank you for joining our platform as an ${admin.role}.</p>
        <p><strong>Your Details:</strong></p>
        <ul>
          <li>Name: ${admin.firstname} ${admin.lastname}</li>
          <li>Email: ${admin.email}</li>
          <li>Role: ${admin.role}</li>
        </ul>
        <p>Please use the following link to log in:</p>
        <a href="http://localhost:5173/auth/admin-login">Login to your Admin Dashboard</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>YourApp Team</p>
      `;
            try {
                await this.emailService.sendEmail({
                    from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
                    to: admin.email,
                    subject,
                    html,
                });
                console.log(`Email sent to ${admin.email}`);
            }
            catch (error) {
                emailError = error;
                console.warn(`Failed to send email to ${admin.email}: ${error.message}`);
            }
            return admin;
        }
        catch (err) {
            console.error("Create Admin Error:", err);
            throw err;
        }
    }
    async updateAdmin(id, adminData, profileImagePath) {
        if (!id) {
            throw new Error("Admin ID is required");
        }
        const updateData = {
            ...adminData,
            firstname: adminData.firstName || adminData.firstname,
            lastname: adminData.lastName || adminData.lastname,
        };
        delete updateData.firstName;
        delete updateData.lastName;
        if (updateData.password && !updateData.password.startsWith("$2")) {
            updateData.password = await bcrypt_1.default.hash(updateData.password, 10);
        }
        if (profileImagePath) {
            updateData.profileImage = (0, imageUtils_1.ensureFullImageUrl)(profileImagePath);
        }
        else if (updateData.profileImage) {
            updateData.profileImage = (0, imageUtils_1.ensureFullImageUrl)(updateData.profileImage);
        }
        return await this.adminRepository.updateAdmin(id, updateData);
    }
    async updateAdminProfileImage(id, profileImagePath) {
        if (!id) {
            throw new Error("Admin ID is required");
        }
        if (!profileImagePath) {
            throw new Error("Profile image path is required");
        }
        const profileImageUrl = (0, imageUtils_1.ensureFullImageUrl)(profileImagePath);
        return await this.adminRepository.updateAdmin(id, { profileImage: profileImageUrl });
    }
    async findAdminById(id) {
        if (!id) {
            throw new Error("Admin ID is required");
        }
        return await this.adminRepository.findAdminById(id);
    }
    async findAdminByEmail(email) {
        if (!email) {
            throw new Error("Email is required");
        }
        return await this.adminRepository.findAdminByEmail(email);
    }
    async deleteAdmin(id) {
        if (!id) {
            throw new Error("Admin ID is required");
        }
        return await this.adminRepository.deleteAdmin(id);
    }
    async getAllAdmins() {
        return await this.adminRepository.getAllAdmins();
    }
    async searchUsers(searchTerm, role = "Admin") {
        try {
            // Normalize user data to match the frontend's User interface
            const normalizeUser = (user) => ({
                _id: user._id?.toString() || user.id || "",
                id: user._id?.toString() || user.id || "",
                username: user.username || "",
                email: user.email || "",
                role: user.role || "Admin",
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                profileImage: user.profileImage || "",
                isActive: user.isBlock !== undefined ? !user.isBlock : true,
                courses: Array.isArray(user.courses)
                    ? user.courses.map((course) => ({
                        courseId: course.courseId?._id?.toString() || course.courseId || "",
                        name: course.courseId?.name || course.name || "",
                        code: course.courseId?.code || course.code || "",
                        department: course.courseId?.departmentId?.name || course.department || "",
                    }))
                    : [],
            });
            let users = [];
            if (role && role !== "All") {
                switch (role) {
                    case "Admin":
                        const admins = await this.adminRepository.searchUsers(searchTerm, role);
                        users = admins.map(normalizeUser);
                        break;
                    case "Teacher":
                        const teachers = await this.teacherRepository.searchUsers(searchTerm, role);
                        users = teachers.map(normalizeUser);
                        break;
                    case "Student":
                        const students = await this.studentRepository.searchUsers(searchTerm, role);
                        users = students.map(normalizeUser);
                        break;
                    default:
                        throw new Error("Invalid role specified");
                }
            }
            else {
                const [admins, teachers, students] = await Promise.all([
                    this.adminRepository.searchUsers(searchTerm, "Admin"),
                    this.teacherRepository.searchUsers(searchTerm, "Teacher"),
                    this.studentRepository.searchUsers(searchTerm, "Student"),
                ]);
                users = [
                    ...admins.map(normalizeUser),
                    ...teachers.map(normalizeUser),
                    ...students.map(normalizeUser),
                ];
            }
            return users;
        }
        catch (err) {
            console.error("Search Users Error:", err);
            throw new Error(`Failed to search users: ${err.message}`);
        }
    }
}
exports.AdminUseCase = AdminUseCase;
//# sourceMappingURL=AdminUseCase.js.map
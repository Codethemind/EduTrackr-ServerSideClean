"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Admin {
    constructor(data) {
        this.id = data.id;
        this.username = data.username ?? '';
        this.firstname = data.firstname ?? '';
        this.lastname = data.lastname ?? '';
        this.email = data.email ?? '';
        this.password = data.password ?? '';
        this.profileImage = data.profileImage;
        this.role = 'Admin'; // default role
    }
}
exports.default = Admin;
//# sourceMappingURL=Admin.js.map
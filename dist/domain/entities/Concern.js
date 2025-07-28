"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Concern = exports.ConcernType = exports.ConcernStatus = void 0;
// domain/entities/Concern.ts
var ConcernStatus;
(function (ConcernStatus) {
    ConcernStatus["PENDING"] = "pending";
    ConcernStatus["REJECTED"] = "rejected";
    ConcernStatus["IN_PROGRESS"] = "in_progress";
    ConcernStatus["SOLVED"] = "solved";
})(ConcernStatus || (exports.ConcernStatus = ConcernStatus = {}));
var ConcernType;
(function (ConcernType) {
    ConcernType["ACADEMIC"] = "Academic";
    ConcernType["ADMINISTRATIVE"] = "Administrative";
})(ConcernType || (exports.ConcernType = ConcernType = {}));
class Concern {
    constructor(data) {
        this.id = data.id || data._id;
        this.title = data.title;
        this.description = data.description;
        this.type = data.type;
        this.status = data.status;
        this.createdBy = data.createdBy;
        this.createdByRole = data.createdByRole;
        this.feedback = data.feedback;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    // Helper method to get user details
    getCreatedByUser() {
        if (typeof this.createdBy === 'object' && this.createdBy !== null) {
            return this.createdBy;
        }
        return null;
    }
    // Helper method to get username
    getCreatedByUsername() {
        const user = this.getCreatedByUser();
        return user ? user.username : 'Unknown';
    }
    // Helper method to get user role
    getCreatedByRole() {
        const user = this.getCreatedByUser();
        return user ? user.role : this.createdByRole || 'Unknown';
    }
}
exports.Concern = Concern;
//# sourceMappingURL=Concern.js.map
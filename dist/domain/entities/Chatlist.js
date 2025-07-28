"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chatlist = void 0;
class Chatlist {
    constructor(data) {
        Object.assign(this, {
            ...data,
            _id: data._id // Handle both _id and id for compatibility
        });
    }
}
exports.Chatlist = Chatlist;
exports.default = Chatlist;
//# sourceMappingURL=Chatlist.js.map
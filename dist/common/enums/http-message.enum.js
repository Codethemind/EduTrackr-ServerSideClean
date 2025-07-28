"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMessage = exports.CourseMessage = exports.ChatMessage = exports.HttpMessage = void 0;
var HttpMessage;
(function (HttpMessage) {
    // Auth-related
    HttpMessage["EMAIL_REQUIRED"] = "Email is required";
    HttpMessage["PASSWORD_REQUIRED"] = "Email, token and new password are required";
    HttpMessage["USER_NOT_FOUND"] = "User does not exist";
    HttpMessage["PASSWORD_INCORRECT"] = "Incorrect Password";
    HttpMessage["INVALID_OR_EXPIRED_TOKEN"] = "Invalid or expired reset token";
    HttpMessage["RESET_SUCCESS"] = "Password has been reset";
    HttpMessage["RESET_SENT"] = "Reset instructions sent";
    HttpMessage["LOGIN_REQUIRED"] = "Email and password are required";
    HttpMessage["LOGIN_SUCCESS"] = "Login successful";
    // Assignment-related
    HttpMessage["MISSING_ASSIGNMENT_FIELDS"] = "Missing required assignment fields";
    HttpMessage["ASSIGNMENT_NOT_FOUND"] = "Assignment not found";
    HttpMessage["ASSIGNMENT_ALREADY_SUBMITTED"] = "Assignment already submitted";
    HttpMessage["LATE_SUBMISSION_NOT_ALLOWED"] = "Late submissions are not allowed for this assignment";
    HttpMessage["MISSING_STUDENT_INFO"] = "Student ID and name are required";
    HttpMessage["SUBMISSION_CONTENT_REQUIRED"] = "Submission content is required";
    HttpMessage["GRADE_EXCEEDS_MAX"] = "Grade cannot exceed maximum marks";
    HttpMessage["SUBMISSION_NOT_FOUND_FOR_STUDENT"] = "No submission found for student ID:";
    HttpMessage["INVALID_DUE_DATE"] = "Due date cannot be in the past";
    // Common/Generic
    HttpMessage["UNAUTHORIZED"] = "You are not authorized to perform this action";
    HttpMessage["FORBIDDEN"] = "Access denied";
    HttpMessage["BAD_REQUEST"] = "Bad request";
    HttpMessage["INTERNAL_ERROR"] = "Something went wrong";
    // Admin-related
    HttpMessage["ADMIN_CREATED"] = "Admin created successfully";
    HttpMessage["ADMIN_CREATION_FAILED"] = "Failed to create admin";
    HttpMessage["PROFILE_IMAGE_UPDATED"] = "Profile image updated successfully";
    HttpMessage["PROFILE_IMAGE_UPDATE_FAILED"] = "Failed to update profile image";
    HttpMessage["ADMIN_NOT_FOUND"] = "Admin not found";
    HttpMessage["ADMIN_RETRIEVED"] = "Admin retrieved successfully";
    HttpMessage["ADMIN_UPDATE_FAILED"] = "Failed to update admin";
    HttpMessage["ADMIN_DELETED"] = "Admin deleted successfully";
    HttpMessage["ADMIN_DELETE_FAILED"] = "Failed to delete admin";
    HttpMessage["ADMINS_RETRIEVED"] = "Admins retrieved successfully";
    HttpMessage["ADMINS_RETRIEVE_FAILED"] = "Failed to retrieve admins";
    HttpMessage["USERS_RETRIEVED"] = "Users retrieved successfully";
    HttpMessage["NO_USERS_FOUND"] = "No users found";
    HttpMessage["USER_SEARCH_FAILED"] = "Failed to search users";
    HttpMessage["INVALID_SEARCH_TERM"] = "Invalid search term";
    HttpMessage["INVALID_ROLE_PARAM"] = "Invalid role parameter";
    HttpMessage["NO_IMAGE_UPLOADED"] = "No image uploaded";
})(HttpMessage || (exports.HttpMessage = HttpMessage = {}));
// src/common/enums/chat-message.enum.ts
var ChatMessage;
(function (ChatMessage) {
    // Chat initiation
    ChatMessage["CHAT_INITIATED_SUCCESSFULLY"] = "Chat initiated successfully";
    ChatMessage["CHAT_INITIATION_FAILED"] = "Failed to initiate chat";
    ChatMessage["INVALID_USER_ID"] = "Invalid teacherId or studentId format";
    // Message saving
    ChatMessage["MISSING_REQUIRED_FIELDS"] = "Missing required fields";
    ChatMessage["MESSAGE_OR_MEDIA_REQUIRED"] = "Message or media is required";
    ChatMessage["MESSAGE_SAVE_FAILED"] = "Failed to save message";
    ChatMessage["MESSAGE_SAVED_SUCCESSFULLY"] = "Message saved successfully";
    // Message deletion
    ChatMessage["MESSAGE_DELETED_SUCCESSFULLY"] = "Message deleted successfully";
    ChatMessage["MESSAGE_DELETE_FAILED"] = "Failed to delete message";
    // Reactions
    ChatMessage["REACTION_ADDED"] = "Reaction added successfully";
    ChatMessage["REACTION_FAILED"] = "Failed to add reaction";
    // Fetch messages
    ChatMessage["CHAT_ID_REQUIRED"] = "Chat ID is required";
    ChatMessage["MESSAGE_FETCH_FAILED"] = "Failed to get messages";
    // Chat list
    ChatMessage["USER_ID_REQUIRED"] = "User ID is missing";
    ChatMessage["CHAT_LIST_FETCH_FAILED"] = "Failed to get chat list";
    // Typing & seen
    ChatMessage["USER_TYPING"] = "User is typing";
    ChatMessage["MESSAGES_SEEN"] = "Messages seen";
    // User connection
    ChatMessage["USER_CONNECTED"] = "User connected to chat";
    ChatMessage["USER_DISCONNECTED"] = "User disconnected from chat";
})(ChatMessage || (exports.ChatMessage = ChatMessage = {}));
var CourseMessage;
(function (CourseMessage) {
    CourseMessage["COURSE_NAME_REQUIRED"] = "Course name is required and cannot be empty";
    CourseMessage["COURSE_CODE_REQUIRED"] = "Course code is required and cannot be empty";
    CourseMessage["COURSE_NAME_EXISTS"] = "Course with this name already exists";
    CourseMessage["COURSE_CODE_EXISTS"] = "Course with this code already exists";
    CourseMessage["COURSE_ID_REQUIRED"] = "Course ID is required";
    CourseMessage["DEPARTMENT_ID_REQUIRED"] = "Department ID is required";
    CourseMessage["COURSE_NOT_FOUND"] = "Course not found";
})(CourseMessage || (exports.CourseMessage = CourseMessage = {}));
var NotificationMessage;
(function (NotificationMessage) {
    NotificationMessage["CREATE_FAILED"] = "Failed to create notification";
    NotificationMessage["FETCH_FAILED"] = "Failed to fetch notifications";
    NotificationMessage["MARK_READ_FAILED"] = "Failed to mark notification as read";
    NotificationMessage["MARK_ALL_READ_FAILED"] = "Failed to mark all notifications as read";
    NotificationMessage["DELETE_FAILED"] = "Failed to delete notification";
})(NotificationMessage || (exports.NotificationMessage = NotificationMessage = {}));
//# sourceMappingURL=http-message.enum.js.map
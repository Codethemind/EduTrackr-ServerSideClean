// src/controllers/StudentController.ts

import { Request, Response } from "express";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";


export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

  async createStudent(req: Request, res: Response): Promise<void> {
    console.log(req.body)
    try {
      // Handle field name inconsistencies
      const studentData = {
        ...req.body,
        // Convert firstName/lastName to firstname/lastname if they exist
        firstname: req.body.firstName || req.body.firstname,
        lastname: req.body.lastName || req.body.lastname
      };

      // Parse courses if it's a string
      if (typeof studentData.courses === 'string') {
        try {
          studentData.courses = JSON.parse(studentData.courses);
        } catch (e) {
          console.error("Error parsing courses:", e);
        }
      }

      // Remove fields that aren't in our model
      delete studentData.firstName;
      delete studentData.lastName;
      
      const student = await this.studentUseCase.createStudent(studentData);
      res.status(201).json({ success: true, data: student });
    } catch (err: any) {
      console.error("Create Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to create student", error: err.message });
    }
  }

  async createStudentWithImage(req: Request, res: Response): Promise<void> {
    try {
      console.log("Creating student with image, received data:", req.body);
      
      // Get student data from request body
      const studentData: any = {
        ...req.body,
        // Convert firstName/lastName to firstname/lastname if they exist
        firstname: req.body.firstName || req.body.firstname,
        lastname: req.body.lastName || req.body.lastname,
        // Ensure these required fields are set
        department: req.body.department,
        class: req.body.class,
        role: 'Student'
      };

      // Parse courses if it's a string
      if (typeof studentData.courses === 'string') {
        try {
          studentData.courses = JSON.parse(studentData.courses);
        } catch (e) {
          console.error("Error parsing courses:", e);
          // Set to empty array as fallback
          studentData.courses = [];
        }
      } else if (!studentData.courses) {
        // Ensure courses is at least an empty array
        studentData.courses = [];
      }

      // Remove fields that aren't in our model
      delete studentData.firstName;
      delete studentData.lastName;
      delete studentData.isActive; // Frontend sends isActive, we use isBlock

      // Add profile image URL if image was uploaded
      if (req.file) {
        console.log("Profile image uploaded:", req.file.path);
        // Store the full URL using our helper function
        studentData.profileImage = ensureFullImageUrl(req.file.path);
      }
      
      console.log("Processed student data:", studentData);
      
      const student = await this.studentUseCase.createStudent(studentData);
      res.status(201).json({ 
        success: true, 
        message: "Student created successfully",
        data: student 
      });
    } catch (err: any) {
      console.error("Create Student With Image Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create student", 
        error: err.message 
      });
    }
  }

  async updateProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.id;
      
      if (!req.file) {
        res.status(400).json({ success: false, message: "No image uploaded" });
        return;
      }
      
      // Ensure full URL using our helper function
      const profileImageUrl = ensureFullImageUrl(req.file.path);
      
      // Update only the profile image
      const updatedStudent = await this.studentUseCase.updateStudent(studentId, { 
        profileImage: profileImageUrl 
      });
      
      if (!updatedStudent) {
        res.status(404).json({ success: false, message: "Student not found" });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Profile image updated successfully",
        data: {
          profileImage: profileImageUrl,
          student: updatedStudent
        }
      });
    } catch (err: any) {
      console.error("Update Profile Image Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update profile image", 
        error: err.message 
      });
    }
  }

  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.params.id)
      const student = await this.studentUseCase.getStudentById(req.params.id);
      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
      } else {
        res.json({ success: true, data: student });
      }
    } catch (err: any) {
      console.error("Get Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch student", error: err.message });
    }
  }


  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.id;
      
      // Validate student ID
      if (!studentId || studentId === 'null') {
        res.status(400).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
        return;
      }

      // Create a copy of the request body
      const updateData = {...req.body};

      // Check if password is being updated
      if (updateData.password) {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        if (!updateData.password.startsWith('$2')) {
          // Hash the password before updating
          const bcrypt = require('bcrypt');
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }
      }
      
      // Handle field name inconsistencies
      if (updateData.firstName) {
        updateData.firstname = updateData.firstName;
        delete updateData.firstName;
      }
      
      if (updateData.lastName) {
        updateData.lastname = updateData.lastName;
        delete updateData.lastName;
      }
      
      // Parse courses if it's a string
      if (typeof updateData.courses === 'string') {
        try {
          updateData.courses = JSON.parse(updateData.courses);
        } catch (e) {
          console.error("Error parsing courses:", e);
        }
      }

      // Handle profileImage if it's being updated but not through the dedicated endpoint
      if (updateData.profileImage) {
        updateData.profileImage = ensureFullImageUrl(updateData.profileImage);
      }

      const student = await this.studentUseCase.updateStudent(studentId, updateData);
      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
      } else {
        res.json({ success: true, data: student });
      }
    } catch (err: any) {
      console.error("Update Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to update student", error: err.message });
    }
  }

  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.studentUseCase.deleteStudent(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Student not found" });
      } else {
        res.json({ success: true, message: "Student deleted successfully" });
      }
    } catch (err: any) {
      console.error("Delete Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to delete student", error: err.message });
    }
  }

  async getAllStudents(_req: Request, res: Response): Promise<void> {
    try {
      const students = await this.studentUseCase.getAllStudents();
      res.json({ success: true, data: students });
    } catch (err: any) {
      console.error("Get All Students Error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch students", error: err.message });
    }
  }
}

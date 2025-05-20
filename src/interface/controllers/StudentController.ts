// src/controllers/StudentController.ts

import { Request, Response } from "express";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";
import { validateUser, validateUserUpdate, validateProfileImage } from "../../infrastructure/middleware/validation";
import { isValidObjectId } from "mongoose";
import CourseModel from "../../infrastructure/models/CourseModel";
import DepartmentModel from "../../infrastructure/models/DepartmentModel";

export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

  async createStudentWithImage(req: Request, res: Response): Promise<Response> {
    try {

      const studentData: any = {
        ...req.body,
        firstname:  req.body.firstname,
        lastname: req.body.lastname,
        department: req.body.department,
        class: req.body.class,
        role: 'Student'
      };

     
      if (!isValidObjectId(studentData.department)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID",
          error: "Department ID must be a valid ObjectId"
        });
      }

      
      const department = await DepartmentModel.findById(studentData.department);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department not found",
          error: "The specified department does not exist"
        });
      }

      
      let courseIds = [];
      if (typeof studentData.courses === 'string') {
        try {
          courseIds = JSON.parse(studentData.courses);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid courses format",
            error: "Courses must be a valid JSON array"
          });
        }
      } else if (!studentData.courses) {
        courseIds = [];
      }

      if (courseIds.length > 0) {
        try {
          const courses = await CourseModel.find({ _id: { $in: courseIds } })
            .populate<{ departmentId: { name: string } }>('departmentId', 'name');
          
          if (courses.length !== courseIds.length) {
            return res.status(400).json({
              success: false,
              message: "One or more course IDs are invalid",
              error: "Could not find all specified courses"
            });
          }

          studentData.courses = courses.map(course => ({
            courseId: course._id,
            name: course.name,
            code: course.code,
            department: course.departmentId.name
          }));
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Error fetching course details",
            error: "One or more course IDs are invalid"
          });
        }
      } else {
        studentData.courses = [];
      }

  
      if (req.file) {
        studentData.profileImage = ensureFullImageUrl(req.file.path);
      }
      
      const student = await this.studentUseCase.createStudent(studentData);
      return res.status(201).json({ 
        success: true, 
        message: "Student created successfully",
        data: this.formatStudentForResponse(student)
      });
    } catch (err: any) {
      console.error("Create Student With Image Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to create student", 
        error: err.message 
      });
    }
  }

  async updateProfileImage(req: Request, res: Response): Promise<Response> {
  try {
    const studentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const imageUrl = req.file.path; // assuming Cloudinary multer setup gives URL here

    const updatedStudent = await this.studentUseCase.updateStudent(studentId, {
      profileImage: imageUrl
    });

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: updatedStudent.profileImage,
        student: updatedStudent
      }
    });
  } catch (err: any) {
    console.error("Error updating student profile image:", err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
}

  async getStudentById(req: Request, res: Response): Promise<Response> {
    try {
      const studentId = req.params.id;
      
      if (!studentId || !isValidObjectId(studentId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
      }

      const student = await this.studentUseCase.getStudentById(studentId);
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(200).json({ 
        success: true, 
        data: this.formatStudentForResponse(student)
      });
    } catch (err: any) {
      console.error("Get Student Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch student", 
        error: err.message 
      });
    }
  }

  async updateStudent(req: Request, res: Response): Promise<Response> {
    try {
      const studentId = req.params.id;
      
      if (!studentId || !isValidObjectId(studentId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
      }

      const updateData = {...req.body};
      
      if (updateData.password) {
        if (!updateData.password.startsWith('$2')) {
          const bcrypt = require('bcrypt');
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }
      }
      
      if (updateData.firstName) {
        updateData.firstname = updateData.firstName;
        delete updateData.firstName;
      }
      
      if (updateData.lastName) {
        updateData.lastname = updateData.lastName;
        delete updateData.lastName;
      }
      
      // Handle department update
      if (updateData.department && isValidObjectId(updateData.department)) {
        const department = await DepartmentModel.findById(updateData.department);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: "Department not found",
            error: "The specified department does not exist"
          });
        }
      }
      
      // Parse courses if it's a string
      let courseIds = [];
      if (typeof updateData.courses === 'string') {
        try {
          courseIds = JSON.parse(updateData.courses);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid courses format",
            error: "Courses must be a valid JSON array"
          });
        }
      } else if (Array.isArray(updateData.courses) && updateData.courses.length > 0) {
        // Extract course IDs if we have an array of course objects
        courseIds = updateData.courses.map((course: any) => 
          typeof course === 'string' ? course : 
          course.courseId ? course.courseId.toString() : 
          course._id ? course._id.toString() : null
        ).filter(Boolean);
      }

      // Fetch course details for each course ID if we have any
      if (courseIds.length > 0) {
        try {
          const courses = await CourseModel.find({ _id: { $in: courseIds } })
            .populate<{ departmentId: { name: string } }>('departmentId', 'name');
          
          if (courses.length !== courseIds.length) {
            return res.status(400).json({
              success: false,
              message: "One or more course IDs are invalid",
              error: "Could not find all specified courses"
            });
          }

          updateData.courses = courses.map(course => ({
            courseId: course._id,
            name: course.name,
            code: course.code,
            department: course.departmentId.name
          }));
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Error fetching course details",
            error: "One or more course IDs are invalid"
          });
        }
      } else if (Array.isArray(updateData.courses)) {
        // If courses is an empty array, keep it as is
        updateData.courses = [];
      }

      if (updateData.profileImage) {
        updateData.profileImage = ensureFullImageUrl(updateData.profileImage);
      }

      const student = await this.studentUseCase.updateStudent(studentId, updateData);
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(200).json({ 
        success: true, 
        message: "Student updated successfully",
        data: this.formatStudentForResponse(student)
      });
    } catch (err: any) {
      console.error("Update Student Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to update student", 
        error: err.message 
      });
    }
  }

  async deleteStudent(req: Request, res: Response): Promise<Response> {
    try {
      const studentId = req.params.id;
      
      if (!studentId || !isValidObjectId(studentId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
      }

      const deleted = await this.studentUseCase.deleteStudent(studentId);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(200).json({ 
        success: true, 
        message: "Student deleted successfully" 
      });
    } catch (err: any) {
      console.error("Delete Student Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to delete student", 
        error: err.message 
      });
    }
  }

  async getAllStudents(_req: Request, res: Response): Promise<Response> {
    try {
      const students = await this.studentUseCase.getAllStudents();
      return res.status(200).json({ 
        success: true, 
        data: students.map(student => this.formatStudentForResponse(student))
      });
    } catch (err: any) {
      console.error("Get All Students Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch students", 
        error: err.message 
      });
    }
  }
  
  // Helper method to format course IDs for frontend consistency
  private formatStudentForResponse(student: any) {
    const formattedStudent = { ...student };
    if (formattedStudent.courses && Array.isArray(formattedStudent.courses)) {
      formattedStudent.courses = formattedStudent.courses.map((course: any) => ({
        ...course,
        id: course.courseId || course._id || course.id,
        courseId: course.courseId || course._id || course.id,
        name: course.name || '',
        code: course.code || '',
        department: course.department || ''
      }));
    }
    
    if (formattedStudent.department && typeof formattedStudent.department === 'object') {
      formattedStudent.departmentId = formattedStudent.department._id?.toString() || formattedStudent.departmentId;
      formattedStudent.departmentName = formattedStudent.department.name || formattedStudent.departmentName;
      formattedStudent.department = formattedStudent.departmentId;
    } else if (formattedStudent.departmentId && formattedStudent.departmentName) {
      formattedStudent.departmentId = String(formattedStudent.departmentId);
      formattedStudent.department = formattedStudent.departmentId;
    }
    
    return formattedStudent;
  }
}

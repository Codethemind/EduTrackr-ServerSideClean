import { Request, Response } from "express";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { ensureFullImageUrl } from "../middleware/multer";
import { validateUser, validateUserUpdate, validateProfileImage } from "../middleware/validation";
import { isValidObjectId } from "mongoose";
import CourseModel from "../../infrastructure/models/CourseModel";
import DepartmentModel from "../../infrastructure/models/DepartmentModel";
import nodemailer from 'nodemailer';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

 async createStudentWithImage(req: Request, res: Response): Promise<Response> {
  let emailError: any = null; // Declare emailError to track email sending status
  try {
    const studentData: any = {
      ...req.body,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      department: req.body.department,
      class: req.body.class,
      role: 'Student',
    };

    if (!isValidObjectId(studentData.department)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid department ID",
        error: "Department ID must be a valid ObjectId",
      });
    }

    const department = await DepartmentModel.findById(studentData.department);
    if (!department) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Department not found",
        error: "The specified department does not exist",
      });
    }

    let courseIds = [];
    if (typeof studentData.courses === 'string') {
      try {
        courseIds = JSON.parse(studentData.courses);
      } catch (e) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid courses format",
          error: "Courses must be a valid JSON array",
        });
      }
    } else if (!studentData.courses) {
      courseIds = [];
    }

    if (courseIds.length > 0) {
      try {
        const courses = await CourseModel.find({ _id: { $in: courseIds } }).populate<{
          departmentId: { name: string };
        }>('departmentId', 'name');

        if (courses.length !== courseIds.length) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "One or more course IDs are invalid",
            error: "Could not find all specified courses",
          });
        }

        studentData.courses = courses.map((course) => ({
          courseId: course._id,
          name: course.name,
          code: course.code,
          department: course.departmentId.name,
        }));
      } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Error fetching course details",
          error: "One or more course IDs are invalid",
        });
      }
    } else {
      studentData.courses = [];
    }

    if (req.file) {
      studentData.profileImage = ensureFullImageUrl(req.file.path);
    } else {
      studentData.profileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
    }

    const student = await this.studentUseCase.createStudent(studentData);

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send welcome email
    const subject = `Welcome to Our Platform, ${student.firstname}!`;
    const html = `
      <h2>Welcome, ${student.firstname} ${student.lastname}!</h2>
      <p>Thank you for joining our platform as a ${student.role}.</p>
      <p><strong>Your Details:</strong></p>
      <ul>
        <li>Name: ${student.firstname} ${student.lastname}</li>
        <li>Email: ${student.email}</li>
        <li>Role: ${student.role}</li>
        <li>Department: ${department.name}</li>
        <li>Class: ${student.class}</li>
      </ul>
      <p>Please use the following link to log in:</p>
      <a href="http://localhost:5173/auth/student-login">Login to your Student Dashboard</a>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>YourApp Team</p>
    `;

    try {
      await transporter.sendMail({
        from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject,
        html,
      });
      console.log(`Email sent to ${student.email}`);
    } catch (error: any) {
      emailError = error;
      console.warn(`Failed to send email to ${student.email}: ${error.message}`);
      // Log to a monitoring service if available
    }

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: emailError ? "Student created successfully, but email sending failed" : "Student created successfully",
      data: this.formatStudentForResponse(student),
    });
  } catch (err: any) {
    console.error("Create Student With Image Error:", err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create student",
      error: err.message,
    });
  }
}

  async updateProfileImage(req: Request, res: Response): Promise<Response> {
    try {
      const studentId = req.params.id;

      if (!req.file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const imageUrl = ensureFullImageUrl(req.file.path);

      const updatedStudent = await this.studentUseCase.updateStudent(studentId, {
        profileImage: imageUrl
      });

      if (!updatedStudent) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Student not found'
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Profile image updated successfully',
        data: {
          profileImage: updatedStudent.profileImage,
          student: updatedStudent
        }
      });
    } catch (err: any) {
      console.error("Error updating student profile image:", err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
        return res.status(HttpStatus.BAD_REQUEST).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
      }

      const student = await this.studentUseCase.getStudentById(studentId);
      if (!student) {
        return res.status(HttpStatus.NOT_FOUND).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, 
        data: this.formatStudentForResponse(student)
      });
    } catch (err: any) {
      console.error("Get Student Error:", err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
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
        return res.status(HttpStatus.BAD_REQUEST).json({ 
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
      
      if (updateData.department && isValidObjectId(updateData.department)) {
        const department = await DepartmentModel.findById(updateData.department);
        if (!department) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "Department not found",
            error: "The specified department does not exist"
          });
        }
      }
      
      let courseIds = [];
      if (typeof updateData.courses === 'string') {
        try {
          courseIds = JSON.parse(updateData.courses);
        } catch (e) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "Invalid courses format",
            error: "Courses must be a valid JSON array"
          });
        }
      } else if (Array.isArray(updateData.courses) && updateData.courses.length > 0) {
        courseIds = updateData.courses.map((course: any) => 
          typeof course === 'string' ? course : 
          course.courseId ? course.courseId.toString() : 
          course._id ? course._id.toString() : null
        ).filter(Boolean);
      }

      if (courseIds.length > 0) {
        try {
          const courses = await CourseModel.find({ _id: { $in: courseIds } })
            .populate<{ departmentId: { name: string } }>('departmentId', 'name');
          
          if (courses.length !== courseIds.length) {
            return res.status(HttpStatus.BAD_REQUEST).json({
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
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "Error fetching course details",
            error: "One or more course IDs are invalid"
          });
        }
      } else if (Array.isArray(updateData.courses)) {
        updateData.courses = [];
      }

      if (updateData.profileImage) {
        updateData.profileImage = ensureFullImageUrl(updateData.profileImage);
      }

      const student = await this.studentUseCase.updateStudent(studentId, updateData);
      if (!student) {
        return res.status(HttpStatus.NOT_FOUND).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, 
        message: "Student updated successfully",
        data: this.formatStudentForResponse(student)
      });
    } catch (err: any) {
      console.error("Update Student Error:", err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
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
        return res.status(HttpStatus.BAD_REQUEST).json({ 
          success: false, 
          message: "Invalid student ID" 
        });
      }

      const deleted = await this.studentUseCase.deleteStudent(studentId);
      if (!deleted) {
        return res.status(HttpStatus.NOT_FOUND).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, 
        message: "Student deleted successfully" 
      });
    } catch (err: any) {
      console.error("Delete Student Error:", err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: "Failed to delete student", 
        error: err.message 
      });
    }
  }

  async getAllStudents(_req: Request, res: Response): Promise<Response> {
    try {
      const students = await this.studentUseCase.getAllStudents();
      return res.status(HttpStatus.OK).json({ 
        success: true, 
        data: students.map(student => this.formatStudentForResponse(student))
      });
    } catch (err: any) {
      console.error("Get All Students Error:", err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: "Failed to fetch students", 
        error: err.message 
      });
    }
  }
  
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
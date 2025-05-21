import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createNewSchedule } from '../../actions/scheduleActions';

const ScheduleForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    department: '',
    course: '',
    teacher: '',
    day: '',
    startTime: '',
    endTime: ''
  });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.department || !formData.course || !formData.teacher || 
        !formData.day || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Get selected course to get semester
      const selectedCourse = courses.find(course => course._id === formData.course);
      if (!selectedCourse) {
        toast.error('Selected course not found');
        return;
      }

      // Get selected teacher
      const selectedTeacher = teachers.find(teacher => teacher._id === formData.teacher);
      if (!selectedTeacher) {
        toast.error('Selected teacher not found');
        return;
      }
      
      // Create schedule object with proper IDs
      const scheduleData = {
        departmentId: formData.department,
        courseId: formData.course,
        teacherId: formData.teacher,    
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        semester: selectedCourse.semester 
      };
      
      console.log('Submitting schedule data:', scheduleData);
      
      // Dispatch the create schedule action
      await dispatch(createNewSchedule(scheduleData)).unwrap();
      
      // Reset form
      setFormData({
        department: '',
        course: '',
        teacher: '',
        day: '',
        startTime: '',
        endTime: ''
      });
      
      toast.success('Schedule created successfully');
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default ScheduleForm; 
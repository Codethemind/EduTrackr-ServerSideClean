import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createNewSchedule } from '../../actions/scheduleActions';
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/teachers');
        if (response.data.success) {
          setTeachers(response.data.data);
        } else {
          toast.error('Failed to load teachers');
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        toast.error('Failed to load teachers');
      }
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.department || !formData.course || !formData.teacher || 
        !formData.day || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      // Get selected course to get semester
      const selectedCourse = courses.find(course => course._id === formData.course);
      if (!selectedCourse) {
        toast.error('Selected course not found');
        return;
      }

      // Get selected teacher
      const selectedTeacher = teachers.find(teacher => teacher.id === formData.teacher);
      if (!selectedTeacher) {
        toast.error('Selected teacher not found');
        return;
      }
      
      // Create schedule object with proper IDs
      const scheduleData = {
        departmentId: formData.department,
        courseId: formData.course,
        teacherId: selectedTeacher.id,    
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
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Department</option>
            {/* Add department options here */}
          </select>
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Course</label>
          <select
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            value={formData.teacher}
            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstname} {teacher.lastname}
              </option>
            ))}
          </select>
        </div>

        {/* Day Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Day</label>
          <select
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm; 
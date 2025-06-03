const CreateAssignmentModal = ({ isOpen, onClose, onSubmit, teacherSchedules }) => {
  // ... existing state ...

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('instructions', instructions);
      formData.append('dueDate', dueDate);
      formData.append('maxMarks', maxMarks.toString());
      formData.append('courseId', courseId);
      formData.append('departmentId', departmentId);
      formData.append('teacherId', teacherId);
      formData.append('allowLateSubmission', allowLateSubmission.toString());
      formData.append('lateSubmissionPenalty', lateSubmissionPenalty.toString());
      formData.append('submissionFormat', submissionFormat);
      formData.append('isGroupAssignment', isGroupAssignment.toString());
      formData.append('maxGroupSize', maxGroupSize.toString());

      // Add files
      if (files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component ...
}; 
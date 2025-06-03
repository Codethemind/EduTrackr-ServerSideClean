// const handleSubmitAssignment = async (assignmentId, submissionData) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/assignments/${assignmentId}/submit`,
//       submissionData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         timeout: 30000, // Increase timeout to 30 seconds
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           // You can use this to show upload progress
//           console.log('Upload Progress:', percentCompleted);
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error submitting assignment:', error);
//     throw error;
//   }
// }; 
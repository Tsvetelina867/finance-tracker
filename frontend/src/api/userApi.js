import axios from '../utils/axiosConfig';

export const updateUserProfile = async (updateData) => {
  const response = await axios.put('/api/user/update', updateData);
  return response.data;
};


// Function to fetch user profile data from the backend
export const fetchUserProfile = async () => {
  try {
    const response = await fetch('/api/user/profile', {  // Replace with your actual API endpoint
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming you're using JWT for auth
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

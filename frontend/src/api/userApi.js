import axios from 'axios';

export const updateUserProfile = async (updateData) => {
  const response = await axios.put('http://localhost:8080/api/user/update', updateData, {
    withCredentials: true, // Allow sending credentials (cookies, etc.)
  });
  return response.data;
};

const jwtToken = localStorage.getItem('token'); // Should only get the token, not 'Bearer '
console.log('JWT Token:', jwtToken); // Ensure no 'Bearer ' is stored

// Function to fetch user profile data from the backend
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: {
            'Authorization': `${jwtToken}`, // Only prepend 'Bearer ' here
        },
        withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};


import axios from 'axios';

const jwtToken = localStorage.getItem('token'); // Should only get the token, not 'Bearer '
console.log('JWT Token:', jwtToken);

export const updateUserProfile = async (updateData) => {
  const response = await axios.put('http://localhost:8080/api/user/update', updateData, {
  headers: {
              'Authorization': `${jwtToken}`,
          },
    withCredentials: true, // Allow sending credentials (cookies, etc.)
  });
  return response.data;
};

// Ensure no 'Bearer ' is stored

// Function to fetch user profile data from the backend
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: {
            'Authorization': `${jwtToken}`,
        },
        withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};


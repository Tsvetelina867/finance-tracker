export const fetchAllCategories = async () => {
    try {
    const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://localhost:8080/api/finance/category`, {
              method: "GET",
              headers: {
                      'Authorization': `${token}`,  // Add "Bearer" prefix before the token
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                    credentials: 'include', // Include credentials to send cookies
                  });
   if (!response.ok) {
         throw new Error('Network response was not ok');
       }

       const data = await response.json();

       return data || [];
     } catch (error) {
       console.error('Error fetching transactions:', error);
       return [];
     }
};
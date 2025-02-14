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

const getToken = () => localStorage.getItem("token");
const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const addCategory = async (categoryData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage
    const response = await fetch('http://localhost:8080/api/finance/category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add category: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding category');
  }
};

export const updateCategory = async (categoryId, category) => {
  try {
    const response = await fetch(`http://localhost:8080/api/finance/category/${categoryId}`, {
      method: "PUT",
      headers: requestHeaders(),
      body: JSON.stringify(category),
    });

    if (!response.ok) throw new Error("Failed to update category");
    return await response.json();

  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};


export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/finance/category/${categoryId}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete category");
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};


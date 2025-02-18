const API_BASE_URL = "http://localhost:8080/api/finance";
const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchAllCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: "GET",
            headers: requestHeaders(),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json() || [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const addCategory = async (categoryData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: "POST",
            headers: requestHeaders(),
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error(`Failed to add category: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding category:", error);
        throw new Error("Error adding category");
    }
};

export const updateCategory = async (categoryId, category) => {
    try {
        const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
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
        const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
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

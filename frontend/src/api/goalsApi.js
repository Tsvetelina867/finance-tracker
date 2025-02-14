import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/finance/goals';

const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchGoalsWithDetails = async (accountId) => {
  try {
    // Fetch all goals for the account
    const goalsResponse = await axios.get(`${API_BASE_URL}/account/${accountId}`, {
      headers: requestHeaders(),
      withCredentials: true,
    });

    const goals = goalsResponse.data;

    // Fetch progress & achievement for each goal in parallel
    const goalsWithDetails = await Promise.all(
      goals.map(async (goal) => {
        try {
          const [progressResponse, achievedResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/${goal.id}/progress`, {
              headers: requestHeaders(),
              withCredentials: true,
            }),
            axios.get(`${API_BASE_URL}/${goal.id}/achieved`, {
              headers: requestHeaders(),
              withCredentials: true,
            }),
          ]);

          return {
            ...goal,
            progress: progressResponse.data,
            isAchieved: achievedResponse.data,
          };
        } catch (error) {
          console.error(`Error fetching details for goal ${goal.id}:`, error);
          return { ...goal, progress: 0, isAchieved: false };
        }
      })
    );

    return goalsWithDetails;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export const getGoalDetails = async (goalId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${goalId}`, {
      headers: requestHeaders(),
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching goal details:', error);
    throw error;
  }
};

export const addGoal = async (goalData) => {
  try {
    const response = await axios.post(API_BASE_URL, goalData, {
      headers: requestHeaders(),
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding goal:", error);
    throw new Error("Error adding goal");
  }
};

export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${goalId}`, goalData, {
      headers: requestHeaders(),
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error("Failed to update goal");
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${goalId}`, {
      headers: requestHeaders(),
      withCredentials: true,
    });

    return true;
  } catch (error) {
    console.error("Error deleting goal:", error);
    return false;
  }
};


export default {
  fetchGoalsWithDetails,
  getGoalDetails,
  addGoal,
  updateGoal,
  deleteGoal,
};

export const fetchPastGoals = async () => {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(`${API_BASE_URL}/past`, {
      headers: { 'Authorization': `${token}` }, // Ensure "Bearer" prefix
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching past goals:", error.response?.data || error);
    return [];
  }
};


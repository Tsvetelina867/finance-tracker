import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/finance/goals';

export const fetchGoalsWithDetails = async (accountId) => {
  try {
    // Fetch all goals for the account
    const goalsResponse = await axios.get(`${API_BASE_URL}/account/${accountId}`, {
      headers: { 'Authorization': `${localStorage.getItem('token')}` },
      withCredentials: true,
    });

    const goals = goalsResponse.data;

    // Fetch progress & achievement for each goal in parallel
    const goalsWithDetails = await Promise.all(
      goals.map(async (goal) => {
        try {
          const [progressResponse, achievedResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/${goal.id}/progress`, {
              headers: { 'Authorization': `${localStorage.getItem('token')}` },
              withCredentials: true,
            }),
            axios.get(`${API_BASE_URL}/${goal.id}/achieved`, {
              headers: { 'Authorization': `${localStorage.getItem('token')}` },
              withCredentials: true,
            })
          ]);

          return {
            ...goal,
            progress: progressResponse.data,
            isAchieved: achievedResponse.data
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

const getGoalDetails = async (goalId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${goalId}`, {
      headers: { 'Authorization': `${localStorage.getItem('token')}` },
            withCredentials: true,
          });

    return response.data;
  } catch (error) {
    console.error('Error fetching goal details:', error);
    throw error;
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

export const addGoal = async (budgetData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage
    const response = await fetch('http://localhost:8080/api/finance/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add goal: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding goal');
  }
};

export const updateGoal = async (goalId, goal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${goalId}`, {
      method: "PUT",
      headers: requestHeaders(),
      body: JSON.stringify(goal),
    });

    if (!response.ok) throw new Error("Failed to update goal");
    return await response.json();

  } catch (error) {
    console.error("Error updating goal:", error);
    return null;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${goalId}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete goal");
    return true;
  } catch (error) {
    console.error("Error deleting goal:", error);
    return false;
  }
};

export default {
  getGoalDetails,
  updateGoal, // ✅ Add updateGoal to the default export
  addGoal,
  deleteGoal,
};

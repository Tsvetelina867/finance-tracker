import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/finance/goals';

export const fetchGoalsWithDetails = async (accountId) => {
  try {
    // Fetch all goals for the account
    const goalsResponse = await axios.get(`${API_BASE_URL}/${accountId}`, {
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

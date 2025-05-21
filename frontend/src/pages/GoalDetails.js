import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import goalsApi, { fetchPastGoals } from '../api/goalsApi';
import '../styles/GoalDetails.css';

const GoalDetails = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedGoal, setUpdatedGoal] = useState({});
  const [amountToAdd, setAmountToAdd] = useState('');
  const [pastGoals, setPastGoals] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const formatDate = (dateValue) => {
   if (!dateValue) return '';

   let day, month, year;

   if (Array.isArray(dateValue)) {
     if (dateValue.length !== 3) {
       console.warn('Invalid date array format:', dateValue);
       return '';
     }

     year = dateValue[0];
     month = dateValue[1];
     day = dateValue[2];
   }
   else if (typeof dateValue === 'string') {
     const date = new Date(dateValue);
     if (isNaN(date.getTime())) {
       console.warn('Invalid date string format:', dateValue);
       return '';
     }
     day = date.getUTCDate();
     month = date.getUTCMonth() + 1;
     year = date.getUTCFullYear();
   }
   else if (dateValue instanceof Date) {
     if (isNaN(dateValue.getTime())) {
       console.warn('Invalid Date object:', dateValue);
       return '';
     }
     day = dateValue.getUTCDate();
     month = dateValue.getUTCMonth() + 1;
     year = dateValue.getUTCFullYear();
   }
   else {
     console.warn('Unrecognized date format:', dateValue);
     return '';
   }

   return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
 };


  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        const goalData = await goalsApi.getGoalDetails(goalId);

        const formattedGoal = {
          ...goalData,
          deadline: goalData.deadline
        };

        setGoal(formattedGoal);
        setUpdatedGoal(formattedGoal);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching goal details', error);
        setError('Failed to load goal details');
        setLoading(false);
      }
    };

    const fetchPastGoalsForUser = async (userId) => {
          try {
            const goalsData = await fetchPastGoals(userId);

            const filteredGoals = goalsData ? goalsData.filter(pastGoal => pastGoal.id !== goalId) : [];

            setPastGoals(filteredGoals);
          } catch (error) {
            console.error('Error fetching past goals for user', error);
            setPastGoals([]);
          }
        };

        fetchGoalDetails();
      }, [goalId]);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleEditClick = () => {
    setEditMode(true);
    setUpdatedGoal(prev => ({
      ...goal,
      deadline: goal.deadline
    }));
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setUpdatedGoal({...goal});
    setError('');
  };

  const handleSaveClick = async () => {
    const targetAmount = parseFloat(updatedGoal.targetAmount);
    const currentAmount = parseFloat(updatedGoal.currentAmount);

    if (isNaN(targetAmount) || isNaN(currentAmount)) {
      setError("Please enter valid numbers for the amounts.");
      return;
    }

    if (targetAmount <= 0) {
      setError("Target amount must be positive.");
      return;
    }

    if (currentAmount < 0) {
      setError("Current amount cannot be negative.");
      return;
    }

    if (!updatedGoal.deadline) {
      setError("Please select a deadline.");
      return;
    }

    setError('');

    try {
      const goalDataToUpdate = {
        id: updatedGoal.id,
        name: updatedGoal.name,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        deadline: updatedGoal.deadline,
        account: {
          id: updatedGoal.account.id
        }
      };

      const updatedGoalData = await goalsApi.updateGoal(goalId, goalDataToUpdate);
      setGoal(prevGoal => ({
        ...prevGoal,
        ...updatedGoalData,
        deadline: updatedGoalData.deadline
      }));
      setEditMode(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedGoal({ ...updatedGoal, [name]: value });
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(amountToAdd);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setError('');

    try {
      const newAmount = parseFloat(goal.currentAmount) + amount;
      const updatedGoalData = {
        ...goal,
        currentAmount: newAmount,
        account: { id: goal.account.id }
      };

      await goalsApi.updateGoal(goalId, updatedGoalData);

      setGoal({
        ...goal,
        currentAmount: newAmount
      });
      setUpdatedGoal({
        ...updatedGoal,
        currentAmount: newAmount
      });

      setAmountToAdd('');
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to add funds. Please try again.');
    }
  };

  const handleDeleteGoal = async () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const result = await goalsApi.deleteGoal(goalId);
        if (result) {
          navigate('/dashboard');
        } else {
          setError('Failed to delete goal. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting goal:', error);
        setError('Failed to delete goal. Please try again.');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!goal) return <p>Goal not found.</p>;

  const progressPercentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  const goalStatus = progressPercentage === 100 ? 'Achieved 🎉' : goal.isAchieved ? 'Achieved 🎉' : 'In Progress';

  return (
    <div className="goal-details-container">
      <button onClick={handleBackClick} className="back-button">⬅ Back to Dashboard</button>

      {error && <div className="error-message">{error}</div>}

      <div className="goal-card">
        <h2>{editMode ? (
          <input type="text" name="name" value={updatedGoal.name} onChange={handleInputChange} required />
        ) : (
          goal.name
        )}</h2>

        <div className="goal-info">
          <p><strong>Target Amount:</strong> {editMode ? (
            <input
              type="number"
              name="targetAmount"
              value={updatedGoal.targetAmount}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
              required
            />
          ) : (
            `${goal.targetAmount} ${goal.account.currency}`
          )}</p>

          <p><strong>Current Amount:</strong> {editMode ? (
            <input
              type="number"
              name="currentAmount"
              value={updatedGoal.currentAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          ) : (
            `${goal.currentAmount} ${goal.account.currency}`
          )}</p>

          <p><strong>Deadline:</strong> {editMode ? (
            <input
              type="date"
              name="deadline"
              value={updatedGoal.deadline}
              onChange={handleInputChange}
              required
            />
          ) : (
            formatDate(goal.deadline)
          )}</p>

          <p><strong>Status:</strong> {goalStatus}</p>
        </div>

        <div className="progress-container">
          <label>Progress: {progressPercentage}%</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="goal-actions">
          {editMode ? (
            <>
              <button onClick={handleSaveClick} className="save-button">💾 Save</button>
              <button onClick={handleCancelClick} className="cancel-button">❌ Cancel</button>
            </>
          ) : (
            <button onClick={handleEditClick} className="edit-button">✏ Edit Goal</button>
          )}

          {!editMode && (
            <>
              <button onClick={handleAddFunds} className="add-funds-button">💸 Add Funds</button>
              <button onClick={handleDeleteGoal} className="delete-button">🗑 Delete Goal</button>
            </>
          )}
        </div>

        {!editMode && (
          <div className="add-funds-container">
            <input
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              placeholder="Amount to add"
              min="0.01"
              step="0.01"
            />
          </div>
        )}
      </div>

      <div className="past-goals-container">
        <h3>Past Goals</h3>
        {Array.isArray(pastGoals) && pastGoals.length > 0 ? (
          <ul>
            {pastGoals.map((pastGoal) => (
              <li key={pastGoal.id}>
                <h4>{pastGoal.name}</h4>
               <p>Completed: {formatDate(pastGoal.deadline)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past goals found.</p>
        )}
      </div>
    </div>
  );
};

export default GoalDetails;
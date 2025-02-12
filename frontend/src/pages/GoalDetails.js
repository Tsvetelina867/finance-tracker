import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import goalsApi from '../api/goalsApi';
import '../styles/GoalDetails.css';

const GoalDetails = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedGoal, setUpdatedGoal] = useState({});
  const [amountToAdd, setAmountToAdd] = useState(''); // Set to empty string initially
  const [pastGoals, setPastGoals] = useState([]); // For storing past goals
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        const goalData = await goalsApi.getGoalDetails(goalId);
        const formattedGoal = {
          ...goalData,
          deadline: goalData.deadline
            ? new Date(goalData.deadline).toISOString().split('T')[0]
            : "",
        };
        setGoal(formattedGoal);
        setUpdatedGoal(formattedGoal);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching goal details', error);
        setLoading(false);
      }
    };

    const fetchPastGoals = async () => {
      try {
        const goalsData = await goalsApi.getPastGoals(); // Replace with your actual API call
        setPastGoals(goalsData);
      } catch (error) {
        console.error('Error fetching past goals', error);
      }
    };

    fetchGoalDetails();
    fetchPastGoals();
  }, [goalId]);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setUpdatedGoal(goal);
  };

  const handleSaveClick = async () => {
    try {
      await goalsApi.updateGoal(goalId, updatedGoal);
      setGoal(updatedGoal);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleInputChange = (e) => {
    setUpdatedGoal({ ...updatedGoal, [e.target.name]: e.target.value });
  };

  const handleAddFunds = () => {
    const newAmount = goal.currentAmount + parseFloat(amountToAdd);
    const updatedGoal = { ...goal, currentAmount: newAmount };

    // Update goal progress in local storage (or backend if needed)
    setGoal(updatedGoal);
    setUpdatedGoal(updatedGoal);

    // Optionally, you can also update the goal on the backend
    goalsApi.updateGoal(goalId, updatedGoal)
      .then(() => console.log('Goal updated successfully'))
      .catch(error => console.error('Error updating goal:', error));

    setAmountToAdd(''); // Reset amount field after adding funds
  };

  const handleDeleteGoal = () => {
    goalsApi.deleteGoal(goalId)
      .then(() => {
        console.log('Goal deleted');
        navigate('/dashboard'); // Redirect to dashboard after deletion
      })
      .catch(error => console.error('Error deleting goal:', error));
  };

  if (loading) return <p>Loading...</p>;
  if (!goal) return <p>Goal not found.</p>;

  return (
    <div className="goal-details-container">
      <button onClick={handleBackClick} className="back-button">⬅ Back to Dashboard</button>

      <div className="goal-card">
        <h2>{editMode ? (
          <input type="text" name="name" value={updatedGoal.name} onChange={handleInputChange} />
        ) : (
          goal.name
        )}</h2>

        <div className="goal-info">
          <p><strong>Target Amount:</strong> {editMode ? (
            <input type="number" name="targetAmount" value={updatedGoal.targetAmount} onChange={handleInputChange} />
          ) : (
            `${goal.targetAmount} ${goal.account.currency}`
          )}</p>

          <p><strong>Current Amount:</strong> {editMode ? (
            <input type="number" name="currentAmount" value={updatedGoal.currentAmount} onChange={handleInputChange} />
          ) : (
            `${goal.currentAmount} ${goal.account.currency}`
          )}</p>

          <p><strong>Deadline:</strong> {editMode ? (
            <input type="date" name="deadline" value={updatedGoal.deadline} onChange={handleInputChange} />
          ) : (
            new Date(goal.deadline).toLocaleDateString()
          )}</p>

          <p><strong>Status:</strong> {goal.isAchieved ? 'Achieved 🎉' : 'In Progress'}</p>
        </div>

        <div className="progress-container">
          <label>Progress: {Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0}%</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0}%` }}></div>
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

          <button onClick={handleAddFunds} className="add-funds-button">💸 Add Funds</button>

          <button onClick={handleDeleteGoal} className="delete-button">🗑 Delete Goal</button>
        </div>

        <div className="add-funds-container">
          <input
            type="number"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            placeholder="Amount to add"
          />
        </div>
      </div>

      <div className="past-goals-container">
        <h3>Past Goals</h3>
        {pastGoals.length > 0 ? (
          <ul>
            {pastGoals.map((pastGoal) => (
              <li key={pastGoal.id}>
                <h4>{pastGoal.name}</h4>
                <p>Completed: {new Date(pastGoal.deadline).toLocaleDateString()}</p>
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

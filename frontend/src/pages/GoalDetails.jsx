import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import goalsApi, { fetchPastGoals } from "../api/goalsApi";
import { formatDate } from "../utils/dateUtils";
import "../styles/GoalDetails.css";

const GoalDetails = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedGoal, setUpdatedGoal] = useState({});
  const [amountToAdd, setAmountToAdd] = useState("");
  const [pastGoals, setPastGoals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const goalData = await goalsApi.getGoalDetails(goalId);
        setGoal(goalData);
        setUpdatedGoal(goalData);

        const pastGoalsData = await fetchPastGoals(goalData.account.id);
        const filtered = pastGoalsData
          ? pastGoalsData.filter((g) => String(g.id) !== String(goalId))
          : [];
        setPastGoals(filtered);
      } catch (err) {
        console.error("Error fetching goal details", err);
        setError("Failed to load goal details");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [goalId]);

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

    setError("");

    try {
      const saved = await goalsApi.updateGoal(goalId, {
        id: updatedGoal.id,
        name: updatedGoal.name,
        targetAmount,
        currentAmount,
        deadline: updatedGoal.deadline,
        account: { id: updatedGoal.account.id },
      });
      setGoal((prev) => ({ ...prev, ...saved }));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("Failed to update goal. Please try again.");
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setError("");

    try {
      const newAmount = parseFloat(goal.currentAmount) + amount;
      // We call updateGoal but don't need the return value —
      // we update local state directly with newAmount
      await goalsApi.updateGoal(goalId, {
        ...goal,
        currentAmount: newAmount,
        account: { id: goal.account.id },
      });
      setGoal((prev) => ({ ...prev, currentAmount: newAmount }));
      setUpdatedGoal((prev) => ({ ...prev, currentAmount: newAmount }));
      setAmountToAdd("");
    } catch (err) {
      console.error("Error adding funds:", err);
      setError("Failed to add funds. Please try again.");
    }
  };

  const handleDeleteGoal = async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await goalsApi.deleteGoal(goalId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!goal) return <p>Goal not found.</p>;

  const progressPercentage = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100,
  );
  const goalStatus =
    progressPercentage === 100 || goal.isAchieved
      ? "Achieved 🎉"
      : "In Progress";

  return (
    <div className="goal-details-container">
      <button onClick={() => navigate("/dashboard")} className="back-button">
        ⬅ Back to Dashboard
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="goal-card">
        <h2>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={updatedGoal.name}
              onChange={(e) =>
                setUpdatedGoal({ ...updatedGoal, name: e.target.value })
              }
            />
          ) : (
            goal.name
          )}
        </h2>

        <div className="goal-info">
          <p>
            <strong>Target Amount:</strong>{" "}
            {editMode ? (
              <input
                type="number"
                name="targetAmount"
                value={updatedGoal.targetAmount}
                onChange={(e) =>
                  setUpdatedGoal({
                    ...updatedGoal,
                    targetAmount: e.target.value,
                  })
                }
                min="0.01"
                step="0.01"
              />
            ) : (
              `${goal.targetAmount} ${goal.account.currency}`
            )}
          </p>

          <p>
            <strong>Current Amount:</strong>{" "}
            {editMode ? (
              <input
                type="number"
                name="currentAmount"
                value={updatedGoal.currentAmount}
                onChange={(e) =>
                  setUpdatedGoal({
                    ...updatedGoal,
                    currentAmount: e.target.value,
                  })
                }
                min="0"
                step="0.01"
              />
            ) : (
              `${goal.currentAmount} ${goal.account.currency}`
            )}
          </p>

          <p>
            <strong>Deadline:</strong>{" "}
            {editMode ? (
              <input
                type="date"
                name="deadline"
                value={updatedGoal.deadline}
                onChange={(e) =>
                  setUpdatedGoal({ ...updatedGoal, deadline: e.target.value })
                }
              />
            ) : (
              formatDate(goal.deadline)
            )}
          </p>

          <p>
            <strong>Status:</strong> {goalStatus}
          </p>
        </div>

        <div className="progress-container">
          <label>Progress: {progressPercentage}%</label>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="goal-actions">
          {editMode ? (
            <>
              <button onClick={handleSaveClick} className="save-button">
                💾 Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setUpdatedGoal({ ...goal });
                  setError("");
                }}
                className="cancel-button"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="edit-button">
                ✏ Edit Goal
              </button>
              <button onClick={handleAddFunds} className="add-funds-button">
                💸 Add Funds
              </button>
              <button onClick={handleDeleteGoal} className="delete-button">
                🗑 Delete Goal
              </button>
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
        {pastGoals.length > 0 ? (
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
